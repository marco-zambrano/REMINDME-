export interface Category {
  name: string; // Display name
  slug: string; // Unique id (kebab-case)
  icon: string; // Emoji or icon text
  color: string; // Tailwind color class (e.g., 'bg-blue-500')
}
