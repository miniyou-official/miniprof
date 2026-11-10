// Fictional sample people. Not real participants.
export const SAMPLES = {
  attendee: {
    profile: { id: 'demo-1', full_name: 'Priya Sharma', nickname: 'priya_demo', avatar_url: null, bio: 'Returning to work after a career break. Building inclusive workplaces and supporting returning mothers.' },
    details: { role: 'attendee', title: 'Product Designer | Researcher', organization: 'Open to flexible roles', location: 'Bengaluru, India', skills: ['Design', 'Research', 'Work-Life', 'Mentorship'] },
    links: [
      { platform: 'linkedin', url: 'https://www.linkedin.com/', label: 'LinkedIn' },
      { platform: 'instagram', url: 'https://www.instagram.com/', label: 'Instagram' },
      { platform: 'github', url: 'https://github.com/', label: 'GitHub' },
      { platform: 'custom', url: 'https://example.com/', label: 'Portfolio', clickAction: 'qr_prompt' },
    ],
  },
  mentor: {
    profile: { id: 'demo-3', full_name: 'Neha Singh', nickname: 'neha_demo', avatar_url: null, bio: 'Engineering leader who enjoys helping people plan their next step and find balance.' },
    details: { role: 'mentor', title: 'Engineering Manager', organization: 'Sample Software Co.', location: 'Bengaluru, India', skills: ['Leadership', 'Mentorship', 'Technology', 'Work-Life', 'Career Development'] },
    links: [
      { platform: 'linkedin', url: 'https://www.linkedin.com/', label: 'LinkedIn' },
      { platform: 'medium', url: 'https://medium.com/', label: 'Writing' },
      { platform: 'custom', url: 'https://example.com/', label: 'Website' },
    ],
  },
  speaker: {
    profile: { id: 'demo-2', full_name: 'Dr. Meera Iyer', nickname: 'meera_demo', avatar_url: null, bio: 'Researcher and educator working on how people rebuild careers with new skills.' },
    details: { role: 'speaker', title: 'Research Scientist', organization: 'Sample Institute of Technology', location: 'Chennai, India', skills: ['Research', 'Technology', 'Career Development'], session_title: 'Sample session: Rebuilding momentum', session_time: 'Day 1, 11:30 (sample)' },
    links: [
      { platform: 'linkedin', url: 'https://www.linkedin.com/', label: 'LinkedIn' },
      { platform: 'github', url: 'https://github.com/', label: 'GitHub' },
      { platform: 'custom', url: 'https://example.com/', label: 'Website' },
    ],
  },
  organizer: {
    profile: { id: 'demo-4', full_name: 'Kavya Menon', nickname: 'kavya_demo', avatar_url: null, bio: 'Helping the community plan and run the conference, so everyone feels welcome.' },
    details: { role: 'organizer', title: 'Volunteer Lead', organization: 'RMC organizing team (sample)', location: 'Bengaluru, India', skills: ['Community Building', 'Programme Planning', 'Partnerships'] },
    links: [
      { platform: 'linkedin', url: 'https://www.linkedin.com/', label: 'LinkedIn' },
      { platform: 'instagram', url: 'https://www.instagram.com/', label: 'Instagram' },
    ],
  },
};

export const ORDER = ['attendee', 'mentor', 'speaker', 'organizer'];

