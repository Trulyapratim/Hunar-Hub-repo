import { User, Request, Rating, Project } from '../types';

const USERS_KEY = 'hunar_users';
const REQUESTS_KEY = 'hunar_requests';
const RATINGS_KEY = 'hunar_ratings';
const PROJECTS_KEY = 'hunar_projects';
const CURRENT_USER_ID_KEY = 'hunar_current_user_id';

export const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getRequests = (): Request[] => {
  const requests = localStorage.getItem(REQUESTS_KEY);
  return requests ? JSON.parse(requests) : [];
};

export const saveRequests = (requests: Request[]) => {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
};

export const getRatings = (): Rating[] => {
  const ratings = localStorage.getItem(RATINGS_KEY);
  return ratings ? JSON.parse(ratings) : [];
};

export const saveRatings = (ratings: Rating[]) => {
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
};

export const getProjects = (): Project[] => {
  const projects = localStorage.getItem(PROJECTS_KEY);
  return projects ? JSON.parse(projects) : [];
};

export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

export const getCurrentUserId = () => localStorage.getItem(CURRENT_USER_ID_KEY);
export const setCurrentUserId = (id: string | null) => {
  if (id) localStorage.setItem(CURRENT_USER_ID_KEY, id);
  else localStorage.removeItem(CURRENT_USER_ID_KEY);
};

export const getCurrentUser = (): User | null => {
  const id = getCurrentUserId();
  if (!id) return null;
  return getUsers().find(u => u.id === id) || null;
};

export const seedData = () => {
  if (getUsers().length > 0) {
    if (getProjects().length === 0) {
      const sampleProjects: Project[] = [
        {
          id: "proj-1",
          ownerId: "user-1",
          title: "HunarHub Core v2",
          description: "Rebuilding the core architecture of our campus collaboration platform using React 18 and Vite. Looking for contributors to help with the mobile view and accessibility features.",
          techStack: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
          rolesNeeded: ["Frontend Developer", "UI Designer", "QA Tester"],
          githubUrl: "https://github.com/hunarhub/core-v2",
          liveUrl: "https://hunarhub-v2.demo",
          createdAt: new Date().toISOString()
        },
        {
          id: "proj-2",
          ownerId: "user-6",
          title: "EcoTrack Mobile App",
          description: "A mobile application designed to help students track and reduce their carbon footprint within the campus. We have the UI design ready in Figma, now need help with the backend and data visualization.",
          techStack: ["Figma", "React Native", "NodeJS", "ChartJS"],
          rolesNeeded: ["NodeJS Developer", "Mobile Developer", "Data Analyst"],
          createdAt: new Date().toISOString()
        },
        {
          id: "proj-3",
          ownerId: "user-3",
          title: "Low-Cost 3D Printed Prosthetics",
          description: "An open-source project to design and build highly functional, low-cost prosthetic limbs using standard PLA 3D printing. Need help with mechanical optimizations and documentation.",
          techStack: ["AutoCAD", "SolidWorks", "Python"],
          rolesNeeded: ["Mechanical Engineer", "Technical Writer"],
          githubUrl: "https://github.com/open-prosthetics/standard-arm",
          createdAt: new Date().toISOString()
        }
      ];
      saveProjects(sampleProjects);
    }
    return;
  }

  const sampleUsers: User[] = [
    {
      id: "user-1",
      name: "Arjun Mehta",
      email: "arjun@vjti.edu",
      password: "password123",
      college: "VJTI Mumbai",
      year: "3rd Year",
      branch: "CSE",
      bio: "Passionate about React and Frontend architecture. Looking to pick up some Python for AI/ML.",
      avatarColor: "#1F4E79",
      canTeach: ["React", "JavaScript", "Tailwind CSS"],
      wantToLearn: ["Python", "Machine Learning", "Figma"],
      rating: 4.8,
      ratingCount: 12,
      joinedAt: new Date().toISOString()
    },
    {
      id: "user-2",
      name: "Priya Sharma",
      email: "priya@iitd.ac.in",
      password: "password123",
      college: "IIT Delhi",
      year: "2nd Year",
      branch: "ECE",
      bio: "Electronics enthusiast. I can teach you basic circuit design or MATLAB. Want to learn Guitar!",
      avatarColor: "#E8703A",
      canTeach: ["MATLAB", "Circuit Design", "C++"],
      wantToLearn: ["Guitar", "Photography"],
      rating: 4.5,
      ratingCount: 8,
      joinedAt: new Date().toISOString()
    },
    {
      id: "user-3",
      name: "Rahul Nair",
      email: "rahul@bits.edu",
      password: "password123",
      college: "BITS Pilani",
      year: "4th Year",
      branch: "ME",
      bio: "Final year Mechanical student. Pro at AutoCAD and SolidWorks. Trying to learn Web Dev.",
      avatarColor: "#375623",
      canTeach: ["AutoCAD", "SolidWorks", "Physics"],
      wantToLearn: ["JavaScript", "HTML/CSS", "React"],
      rating: 4.2,
      ratingCount: 5,
      joinedAt: new Date().toISOString()
    },
    {
      id: "user-4",
      name: "Ananya Iyer",
      email: "ananya@srcc.edu",
      password: "password123",
      college: "SRCC Delhi",
      year: "3rd Year",
      branch: "Other",
      bio: "Economics major. I can help with Excel and Financial Modeling. Want to learn Graphic Design.",
      avatarColor: "#7030A0",
      canTeach: ["Excel", "Financial Modeling", "Public Speaking"],
      wantToLearn: ["Graphic Design", "Photoshop", "Figma"],
      rating: 4.9,
      ratingCount: 15,
      joinedAt: new Date().toISOString()
    },
    {
      id: "user-5",
      name: "Ishaan Gupta",
      email: "ishaan@rvce.edu",
      password: "password123",
      college: "RVCE Bangalore",
      year: "1st Year",
      branch: "ISE",
      bio: "Freshman hungry for knowledge. I'm a trained Vocalist. Want to learn DSA for placements.",
      avatarColor: "#C00000",
      canTeach: ["Music Production", "Vocals", "C"],
      wantToLearn: ["DSA", "Java", "Python"],
      rating: 4.6,
      ratingCount: 3,
      joinedAt: new Date().toISOString()
    },
    {
      id: "user-6",
      name: "Sanya Malhotra",
      email: "sanya@mit.edu",
      password: "password123",
      college: "MAHE Manipal",
      year: "2nd Year",
      branch: "IT",
      bio: "Design is my soul. Master of Figma and UI/UX basics. Need help with Backend integration.",
      avatarColor: "#4F81BD",
      canTeach: ["Figma", "UI/UX", "Graphic Design"],
      wantToLearn: ["NodeJS", "Express", "SQL"],
      rating: 5.0,
      ratingCount: 6,
      joinedAt: new Date().toISOString()
    },
    {
      id: "user-7",
      name: "Vikram Rathore",
      email: "vikram@nls.edu",
      password: "password123",
      college: "NLS Bangalore",
      year: "4th Year",
      branch: "Other",
      bio: "Law student with a hobby for photography. I can teach lighting and composition.",
      avatarColor: "#843C0C",
      canTeach: ["Photography", "Legal Research", "Spoken English"],
      wantToLearn: ["Video Editing", "Premiere Pro"],
      rating: 4.7,
      ratingCount: 9,
      joinedAt: new Date().toISOString()
    },
    {
      id: "user-8",
      name: "Megha Rao",
      email: "megha@iitm.ac.in",
      password: "password123",
      college: "IIT Madras",
      year: "3rd Year",
      branch: "Civil",
      bio: "I love solving algorithms. I can teach DSA like a pro. Want to learn Yoga.",
      avatarColor: "#00B050",
      canTeach: ["DSA", "Competitive Programming", "Java"],
      wantToLearn: ["Yoga", "Photography"],
      rating: 4.4,
      ratingCount: 7,
      joinedAt: new Date().toISOString()
    }
  ];

  const sampleProjects: Project[] = [
    {
      id: "proj-1",
      ownerId: "user-1",
      title: "HunarHub Core v2",
      description: "Rebuilding the core architecture of our campus collaboration platform using React 18 and Vite. Looking for contributors to help with the mobile view and accessibility features.",
      techStack: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
      rolesNeeded: ["Frontend Developer", "UI Designer", "QA Tester"],
      githubUrl: "https://github.com/hunarhub/core-v2",
      liveUrl: "https://hunarhub-v2.demo",
      createdAt: new Date().toISOString()
    },
    {
      id: "proj-2",
      ownerId: "user-6",
      title: "EcoTrack Mobile App",
      description: "A mobile application designed to help students track and reduce their carbon footprint within the campus. We have the UI design ready in Figma, now need help with the backend and data visualization.",
      techStack: ["Figma", "React Native", "NodeJS", "ChartJS"],
      rolesNeeded: ["NodeJS Developer", "Mobile Developer", "Data Analyst"],
      createdAt: new Date().toISOString()
    },
    {
      id: "proj-3",
      ownerId: "user-3",
      title: "Low-Cost 3D Printed Prosthetics",
      description: "An open-source project to design and build highly functional, low-cost prosthetic limbs using standard PLA 3D printing. Need help with mechanical optimizations and documentation.",
      techStack: ["AutoCAD", "SolidWorks", "Python"],
      rolesNeeded: ["Mechanical Engineer", "Technical Writer"],
      githubUrl: "https://github.com/open-prosthetics/standard-arm",
      createdAt: new Date().toISOString()
    }
  ];

  saveUsers(sampleUsers);
  saveProjects(sampleProjects);
};

export const hashColor = (name: string) => {
  const colors = [
    '#1F4E79', '#4F81BD', '#E8703A', '#375623', 
    '#7030A0', '#C00000', '#843C0C', '#00B050'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const calculateUserRating = (ratings: Rating[], userId: string) => {
  const userRatings = ratings.filter(r => r.toUserId === userId);
  if (userRatings.length === 0) return { rating: 0, count: 0 };
  
  const sum = userRatings.reduce((acc, curr) => acc + curr.stars, 0);
  return {
    rating: sum / userRatings.length,
    count: userRatings.length
  };
};
