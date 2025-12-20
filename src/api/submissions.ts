import { insertSubmission, type ContactSubmission } from '../lib/database';

export async function submitContactForm(data: Omit<ContactSubmission, 'id' | 'created_at' | 'status'>) {
  try {
    const result = await insertSubmission(data);
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { success: false, error: 'Failed to submit form' };
  }
}
