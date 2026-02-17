-- ============================================================================
-- ADMIN AUTHENTICATION AND MANAGEMENT SYSTEM
-- ============================================================================
-- This migration creates a comprehensive admin system with:
-- - Secure authentication (email/password/TOTP)
-- - Role-based access control (RBAC)
-- - Session management
-- - Comprehensive audit logging
-- - Support chat management
-- - Announcement system
-- - Revenue data access logging
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ADMIN ROLES TABLE
-- ============================================================================
-- Defines available admin roles and their default permissions
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    default_permissions JSONB NOT NULL DEFAULT '{}',
    -- Example: {"channels": ["approve", "reject"], "revenue": ["view"], "users": ["view", "edit"]}
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default roles
INSERT INTO admin_roles (name, display_name, description, default_permissions) VALUES
('super_admin', 'Super Administrator', 'Full access to all admin features', 
 '{"channels": ["approve", "reject", "view"], "users": ["view", "edit", "delete"], "revenue": ["view", "export"], "announcements": ["create", "edit", "delete", "send"], "support": ["view", "respond", "close"], "admins": ["create", "edit", "delete", "view"]}'),
('content_moderator', 'Content Moderator', 'Can approve/reject channels and view users', 
 '{"channels": ["approve", "reject", "view"], "users": ["view"]}'),
('support_agent', 'Support Agent', 'Can handle support chats and view users', 
 '{"support": ["view", "respond", "close"], "users": ["view"]}'),
('finance_viewer', 'Finance Viewer', 'Can view revenue data only', 
 '{"revenue": ["view"]}')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. ADMINS TABLE
-- ============================================================================
-- Stores admin user accounts with authentication details
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
    role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE RESTRICT,
    custom_permissions JSONB DEFAULT '{}', -- Override default role permissions if needed
    -- Example: {"channels": ["approve"], "revenue": ["view", "export"]}
    
    -- TOTP (Time-based One-Time Password) for 2FA
    totp_secret VARCHAR(255), -- Base32 encoded secret
    totp_enabled BOOLEAN DEFAULT false,
    totp_backup_codes TEXT[], -- Array of backup codes (hashed)
    
    -- Account security
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMPTZ, -- NULL if not locked
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    last_login_user_agent TEXT,
    
    -- Profile
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES admins(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role_id ON admins(role_id);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);
CREATE INDEX IF NOT EXISTS idx_admins_account_locked ON admins(account_locked_until) WHERE account_locked_until IS NOT NULL;

-- ============================================================================
-- 3. ADMIN SESSIONS TABLE
-- ============================================================================
-- Stores active admin sessions (session tokens are hashed before storage)
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(255) NOT NULL UNIQUE, -- SHA-256 hash of the token
    ip_address INET NOT NULL,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for session lookups
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_last_activity ON admin_sessions(last_activity_at);

-- ============================================================================
-- 4. ADMIN AUDIT LOGS TABLE
-- ============================================================================
-- Comprehensive logging of all admin actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE SET NULL,
    session_id UUID REFERENCES admin_sessions(id) ON DELETE SET NULL,
    
    -- Action details
    action_type VARCHAR(100) NOT NULL, -- e.g., "channel.approved", "user.viewed", "revenue.accessed"
    resource_type VARCHAR(50), -- e.g., "channel", "user", "revenue", "announcement"
    resource_id UUID, -- ID of the resource being acted upon
    
    -- Request context
    ip_address INET NOT NULL,
    user_agent TEXT,
    
    -- Additional context (flexible JSONB for any extra data)
    details JSONB DEFAULT '{}',
    -- Example: {"channel_name": "My Channel", "reason": "Approved for quality content"}
    
    -- Result
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action_type ON admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_resource_type ON admin_audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_resource_id ON admin_audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_resource_composite ON admin_audit_logs(resource_type, resource_id);

-- ============================================================================
-- 5. ADMIN SUPPORT CHATS TABLE
-- ============================================================================
-- Manages support conversations between users and admins
CREATE TABLE IF NOT EXISTS admin_support_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    
    -- Chat metadata
    subject VARCHAR(255),
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- Support chat messages
CREATE TABLE IF NOT EXISTS admin_support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES admin_support_chats(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'user' or 'admin'
    sender_id UUID NOT NULL, -- user_id or admin_id (polymorphic)
    message_text TEXT NOT NULL,
    attachments JSONB DEFAULT '[]', -- Array of file URLs/metadata
    
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for support chats
CREATE INDEX IF NOT EXISTS idx_admin_support_chats_user_id ON admin_support_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_support_chats_assigned_admin ON admin_support_chats(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_support_chats_status ON admin_support_chats(status);
CREATE INDEX IF NOT EXISTS idx_admin_support_messages_chat_id ON admin_support_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_admin_support_messages_created_at ON admin_support_messages(created_at DESC);

-- ============================================================================
-- 6. ADMIN ANNOUNCEMENTS TABLE
-- ============================================================================
-- System announcements that admins can send to users
CREATE TABLE IF NOT EXISTS admin_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
    
    -- Announcement content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    announcement_type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
    
    -- Targeting
    target_audience VARCHAR(50) DEFAULT 'all', -- 'all', 'creators', 'artists', 'businesses'
    target_user_ids UUID[], -- Specific user IDs if targeting specific users
    
    -- Scheduling
    scheduled_for TIMESTAMPTZ, -- NULL = send immediately
    sent_at TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sent', 'cancelled'
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Track which users have seen announcements
CREATE TABLE IF NOT EXISTS admin_announcement_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID NOT NULL REFERENCES admin_announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(announcement_id, user_id)
);

-- Indexes for announcements
CREATE INDEX IF NOT EXISTS idx_admin_announcements_created_by ON admin_announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_admin_announcements_status ON admin_announcements(status);
CREATE INDEX IF NOT EXISTS idx_admin_announcements_scheduled_for ON admin_announcements(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_admin_announcement_reads_announcement ON admin_announcement_reads(announcement_id);
CREATE INDEX IF NOT EXISTS idx_admin_announcement_reads_user ON admin_announcement_reads(user_id);

-- ============================================================================
-- 7. ADMIN REVENUE ACCESS LOGS TABLE
-- ============================================================================
-- Special logging for revenue data access (extra security)
CREATE TABLE IF NOT EXISTS admin_revenue_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE SET NULL,
    session_id UUID REFERENCES admin_sessions(id) ON DELETE SET NULL,
    
    -- Access details
    access_type VARCHAR(50) NOT NULL, -- 'view', 'export', 'filter'
    date_range_start DATE,
    date_range_end DATE,
    filters_applied JSONB DEFAULT '{}', -- Filters used in the query
    export_format VARCHAR(20), -- 'csv', 'json', 'xlsx' if exported
    
    -- Request context
    ip_address INET NOT NULL,
    user_agent TEXT,
    
    -- Additional context
    details JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for revenue access logs
CREATE INDEX IF NOT EXISTS idx_admin_revenue_access_logs_admin_id ON admin_revenue_access_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_revenue_access_logs_created_at ON admin_revenue_access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_revenue_access_logs_access_type ON admin_revenue_access_logs(access_type);

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to check if admin has permission
CREATE OR REPLACE FUNCTION admin_has_permission(
    p_admin_id UUID,
    p_resource VARCHAR(50),
    p_action VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    v_role_permissions JSONB;
    v_custom_permissions JSONB;
    v_resource_permissions JSONB;
BEGIN
    -- Get role permissions and custom permissions
    SELECT 
        ar.default_permissions,
        a.custom_permissions
    INTO 
        v_role_permissions,
        v_custom_permissions
    FROM admins a
    JOIN admin_roles ar ON a.role_id = ar.id
    WHERE a.id = p_admin_id
      AND a.is_active = true
      AND (a.account_locked_until IS NULL OR a.account_locked_until < NOW());
    
    -- If admin not found or locked, return false
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check custom permissions first (they override role permissions)
    IF v_custom_permissions ? p_resource THEN
        v_resource_permissions := v_custom_permissions->p_resource;
        IF v_resource_permissions @> to_jsonb(p_action) THEN
            RETURN true;
        END IF;
    END IF;
    
    -- Check role permissions
    IF v_role_permissions ? p_resource THEN
        v_resource_permissions := v_role_permissions->p_resource;
        IF v_resource_permissions @> to_jsonb(p_action) THEN
            RETURN true;
        END IF;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin action
CREATE OR REPLACE FUNCTION admin_log_action(
    p_admin_id UUID,
    p_session_id UUID,
    p_action_type VARCHAR(100),
    p_resource_type VARCHAR(50),
    p_resource_id UUID,
    p_ip_address INET,
    p_user_agent TEXT,
    p_details JSONB DEFAULT '{}',
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO admin_audit_logs (
        admin_id,
        session_id,
        action_type,
        resource_type,
        resource_id,
        ip_address,
        user_agent,
        details,
        success,
        error_message
    ) VALUES (
        p_admin_id,
        p_session_id,
        p_action_type,
        p_resource_type,
        p_resource_id,
        p_ip_address,
        p_user_agent,
        p_details,
        p_success,
        p_error_message
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log revenue access
CREATE OR REPLACE FUNCTION admin_log_revenue_access(
    p_admin_id UUID,
    p_session_id UUID,
    p_access_type VARCHAR(50),
    p_date_range_start DATE,
    p_date_range_end DATE,
    p_filters_applied JSONB,
    p_export_format VARCHAR(20),
    p_ip_address INET,
    p_user_agent TEXT,
    p_details JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO admin_revenue_access_logs (
        admin_id,
        session_id,
        access_type,
        date_range_start,
        date_range_end,
        filters_applied,
        export_format,
        ip_address,
        user_agent,
        details
    ) VALUES (
        p_admin_id,
        p_session_id,
        p_access_type,
        p_date_range_start,
        p_date_range_end,
        p_filters_applied,
        p_export_format,
        p_ip_address,
        p_user_agent,
        p_details
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions (run via cron)
CREATE OR REPLACE FUNCTION admin_cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM admin_sessions
    WHERE expires_at < NOW()
       OR last_activity_at < NOW() - INTERVAL '30 minutes';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last activity timestamp
CREATE OR REPLACE FUNCTION admin_update_session_activity(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE admin_sessions
    SET last_activity_at = NOW()
    WHERE id = p_session_id
      AND expires_at > NOW()
      AND last_activity_at > NOW() - INTERVAL '30 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Note: Admin tables should only be accessible via service role or Edge Functions
-- RLS is disabled for admin tables as they're accessed server-side only

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_revenue_access_logs ENABLE ROW LEVEL SECURITY;

-- Deny all access by default (only service role can access)
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_roles;
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admins;
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_sessions;
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_audit_logs;
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_support_chats;
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_support_messages;
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_announcements;
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_announcement_reads;
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_revenue_access_logs;
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_roles;
CREATE POLICY "Admin tables are server-side only" ON admin_roles FOR ALL USING (false);
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admins;
CREATE POLICY "Admin tables are server-side only" ON admins FOR ALL USING (false);
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_sessions;
CREATE POLICY "Admin tables are server-side only" ON admin_sessions FOR ALL USING (false);
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_audit_logs;
CREATE POLICY "Admin tables are server-side only" ON admin_audit_logs FOR ALL USING (false);
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_support_chats;
CREATE POLICY "Admin tables are server-side only" ON admin_support_chats FOR ALL USING (false);
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_support_messages;
CREATE POLICY "Admin tables are server-side only" ON admin_support_messages FOR ALL USING (false);
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_announcements;
CREATE POLICY "Admin tables are server-side only" ON admin_announcements FOR ALL USING (false);
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_announcement_reads;
CREATE POLICY "Admin tables are server-side only" ON admin_announcement_reads FOR ALL USING (false);
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_revenue_access_logs;
CREATE POLICY "Admin tables are server-side only" ON admin_revenue_access_logs FOR ALL USING (false);

-- ============================================================================
-- 10. TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_roles_updated_at ON admin_roles;
CREATE TRIGGER update_admin_roles_updated_at
    BEFORE UPDATE ON admin_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_support_chats_updated_at ON admin_support_chats;
CREATE TRIGGER update_admin_support_chats_updated_at
    BEFORE UPDATE ON admin_support_chats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_announcements_updated_at ON admin_announcements;
CREATE TRIGGER update_admin_announcements_updated_at
    BEFORE UPDATE ON admin_announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. INITIAL SUPER ADMIN CREATION (OPTIONAL)
-- ============================================================================
-- Note: This should be run manually with a secure password
-- Example SQL to create first super admin (password should be hashed with bcrypt):
-- 
-- INSERT INTO admins (email, password_hash, role_id, full_name, totp_enabled)
-- SELECT 
--     'admin@elevate.com',
--     '$2b$10$...', -- bcrypt hash of password
--     id,
--     'Super Admin',
--     false
-- FROM admin_roles
-- WHERE name = 'super_admin';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
