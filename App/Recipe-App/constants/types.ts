export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface TransformedCategory {
  id: any;
  title: any;
  description: string;
  image: any;
  cookTime: string;
  servings: number;
  category: any;
  area: any;
  ingredients: string[];
  instructions: any;
  originalData: any;
}

export interface Meal {
  strMeal: string;
  strMealThumb: string;
  idMeal: string;
  strArea: string;
  strCountry: string;
}
