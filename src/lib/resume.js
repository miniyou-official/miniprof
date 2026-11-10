import { supabase } from './supabaseClient';
import { updateProfile } from './auth';

// A Pro resume: one PDF at <user id>/resume.pdf in the public "resumes" bucket, its path saved on the profile (resume_path).
export const RESUME_MAX_BYTES = 2 * 1024 * 1024;
const BUCKET = 'resumes';

// Friendly message when the file is not acceptable, or '' when it is fine
export function checkResumeFile(file) {
    if (!file) return 'Choose a PDF file.';
    const isPdf = file.type === 'application/pdf' && /\.pdf$/i.test(file.name || '');
    if (!isPdf) return 'Only PDF files can be used. Please export your resume as a PDF.';
    if (file.size > RESUME_MAX_BYTES) return 'That file is over 2 MB. Please use a smaller PDF.';
    if (file.size === 0) return 'That file looks empty.';
    return '';
}

// The public link, or '' when the profile has no valid resume. The version stops a browser showing an older copy.
export function resumeUrlFor(userData) {
    const path = userData?.resume_path;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base || typeof path !== 'string' || path !== `${userData?.id}/resume.pdf`) return '';
    const v = userData?.updated_at ? `?v=${encodeURIComponent(userData.updated_at)}` : '';
    return `${base}/storage/v1/object/public/${BUCKET}/${path}${v}`;
}

export async function uploadResume(userId, file) {
    const problem = checkResumeFile(file);
    if (problem) throw new Error(problem);
    const path = `${userId}/resume.pdf`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: 'application/pdf', cacheControl: '300' });
    if (error) throw new Error('Resume upload failed. Please try again.');
    return updateProfile(userId, { resume_path: path });
}

export async function deleteResume(userId) {
    const { error } = await supabase.storage.from(BUCKET).remove([`${userId}/resume.pdf`]);
    if (error) throw new Error('Could not remove your resume. Please try again.');
    return updateProfile(userId, { resume_path: null });
}
