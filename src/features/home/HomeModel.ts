export interface HomeData {
  id: number;
  name: string;
  description?: string;
}

export interface HomeState {
  data: HomeData[];
  loading: boolean;
  error: string | null;
}