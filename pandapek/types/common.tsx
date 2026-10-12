export interface HeaderLink {
  id?: string;
  name: string;
  href: string;
  target?: string;
  rel?: string;
};

export interface Review {
    id: number;
    author: string;
    content: string;
    rating: number;
    game: string;
}
