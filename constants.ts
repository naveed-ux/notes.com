
import { Category, Note } from './types';

// Updated with the UPI ID and Name provided by the user
export const ADMIN_UPI_ID = "7051511591@ptsbi"; 
export const ADMIN_NAME = "Noveed Mir Ug Mohd Ashfaq Mir";

export const MOCK_NOTES: Note[] = [
  {
    id: '1',
    title: 'Advanced React Architecture',
    description: 'Deep dive into patterns, hooks, and state management strategies for enterprise apps.',
    content: 'Long content about React patterns... Context API vs Redux vs Zustand...',
    author: 'Sarah Chen',
    price: 1599.00,
    category: Category.PROGRAMMING,
    rating: 4.8,
    tags: ['React', 'Frontend', 'Software Architecture'],
    createdAt: '2024-03-15',
    isFree: false,
    thumbnailUrl: 'https://picsum.photos/seed/react/600/400'
  },
  {
    id: '2',
    title: 'Organic Chemistry: Reaction Mechanisms',
    description: 'A comprehensive guide to SN1, SN2, E1, and E2 reactions with visual diagrams.',
    content: 'Nucleophilic substitution involves a nucleophile attacking an electrophile...',
    author: 'Dr. James Wilson',
    price: 950.00,
    category: Category.SCIENCE,
    rating: 4.9,
    tags: ['Chemistry', 'Pre-Med', 'Science'],
    createdAt: '2024-02-20',
    isFree: false,
    thumbnailUrl: 'https://picsum.photos/seed/chem/600/400'
  },
  {
    id: '3',
    title: 'Modern World History: Post-WWII',
    description: 'Summary of geopolitical shifts after 1945, the Cold War, and the fall of the Berlin Wall.',
    content: 'The end of World War II saw the rise of two superpowers...',
    author: 'Elena Rodriguez',
    price: 0,
    category: Category.HISTORY,
    rating: 4.5,
    tags: ['History', 'World War II', 'Geopolitics'],
    createdAt: '2024-01-10',
    isFree: true,
    thumbnailUrl: 'https://picsum.photos/seed/history/600/400'
  },
  {
    id: '4',
    title: 'Introduction to Microeconomics',
    description: 'Basic principles of supply and demand, elasticity, and market equilibrium.',
    content: 'Economics is the study of how society manages its scarce resources...',
    author: 'Prof. Miller',
    price: 1200.00,
    category: Category.BUSINESS,
    rating: 4.2,
    tags: ['Economics', 'Business', 'Finance'],
    createdAt: '2024-03-01',
    isFree: false,
    thumbnailUrl: 'https://picsum.photos/seed/econ/600/400'
  }
];
