import type { components, paths } from './generated/api';
import type { Article, Category, Tag } from './types';

export type ApiArticle = components['schemas']['ArticleSchema'];
export type ApiCategory = components['schemas']['CategorySchema'];
export type ApiTag = components['schemas']['TagSchema'];
export type ApiContentSignature = components['schemas']['ContentSignatureSchema'];

export type ApiArticleListResponse =
  paths['/api/articles/']['get']['responses']['200']['content']['application/json'];
export type ApiCategoryListResponse =
  paths['/api/categories/']['get']['responses']['200']['content']['application/json'];
export type ApiTagListResponse =
  paths['/api/tags/']['get']['responses']['200']['content']['application/json'];

type AssertAssignable<T extends true> = T;
type IsAssignable<Actual, Expected> = Actual extends Expected ? true : false;

export type ArticleViewModelFitsApiContract = AssertAssignable<IsAssignable<Article, ApiArticle>>;
export type CategoryViewModelFitsApiContract = AssertAssignable<IsAssignable<Category, ApiCategory>>;
export type TagViewModelFitsApiContract = AssertAssignable<IsAssignable<Tag, ApiTag>>;
