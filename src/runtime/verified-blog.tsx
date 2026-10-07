import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { ArticleImage } from "@/components/article-image"
import type { ResearchArticleSummary, ShopifyResearchArticle } from "@/lib/content/shopify-research"
import { VerifiedSupport } from "./verified-support"
import { FilterPopover } from "./verified-catalog-controls"

const ARTICLE_SORTS = [{ id: "newest", label: "Newest first" }, { id: "oldest", label: "Oldest first" }, { id: "title", label: "A–Z" }] as const

export const articleDate = (date: string) => new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
export function filterArticles(articles: ResearchArticleSummary[], category: string, sort: string) {
  return articles.filter(article => !category || article.tags.includes(category)).slice().sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : (Date.parse(a.publishedAt) - Date.parse(b.publishedAt)) * (sort === "oldest" ? 1 : -1))
}
const ArticleMedia = ({ article, eager = false }: { article: ResearchArticleSummary; eager?: boolean }) => article.image ? <ArticleImage src={article.image.src} alt={article.image.alt || article.title} width={article.image.width} height={article.image.height} sizes="(max-width: 599px) 100vw, (max-width: 999px) 50vw, 25vw" loading={eager ? "eager" : "lazy"} className="verified-journal-image" /> : <div className="verified-journal-image verified-journal-placeholder" aria-hidden="true" />
const ArticleMeta = ({ article }: { article: ResearchArticleSummary }) => <p className="verified-journal-meta"><time dateTime={article.publishedAt}>{articleDate(article.publishedAt)}</time>{article.author && <> · {article.author}</>}</p>
const ArticleCard = ({ article }: { article: ResearchArticleSummary }) => <article className="verified-journal-card"><Link to="/blogs/research/$handle" params={{ handle: article.handle }} className="verified-journal-card-media" aria-label={`Read ${article.title}`}><ArticleMedia article={article} />{article.tags[0] && <span className="verified-journal-tag">{article.tags[0]}</span>}</Link><ArticleMeta article={article} /><h3><Link to="/blogs/research/$handle" params={{ handle: article.handle }}>{article.title}</Link></h3></article>

export const VerifiedBlog = ({ articles, initialPage = 1 }: { articles: ResearchArticleSummary[]; initialPage?: number }) => {
  const [category, setCategory] = useState("")
  const [sort, setSort] = useState("newest")
  const [limit, setLimit] = useState(Math.max(12, initialPage * 12))
  const categories = Array.from(new Set(articles.flatMap(article => article.tags))).sort()
  const filtered = filterArticles(articles, category, sort)
  const [featured, ...rest] = filtered
  return <div className="verified-journal" data-theme-page="blog">
    <header className="verified-journal-hero"><div className="verified-journal-hero-copy"><p>Science Journal</p><h1>Behind the <em>vial</em></h1><p>From purity testing to compound comparisons, explore the science behind research peptides.</p></div><picture className="verified-journal-hero-art"><source media="(max-width: 699px)" srcSet="/images/themes/verified/blog-hero-mobile.webp" /><img src="/images/themes/verified/blog-hero-desktop.webp" alt="" width="1512" height="441" fetchPriority="high" /></picture></header>
    <section className="verified-journal-content" aria-label="Research articles">
      <div className="verified-journal-controls"><div className="verified-journal-categories" aria-label="Article categories"><button aria-pressed={!category} onClick={() => { setCategory(""); setLimit(12) }}>All Articles</button>{categories.map(tag => <button key={tag} aria-pressed={category === tag} onClick={() => { setCategory(tag); setLimit(12) }}>{tag}</button>)}</div><div className="verified-journal-sort"><FilterPopover label="Sort articles" text={sort === "newest" ? "Sort By" : ARTICLE_SORTS.find(({ id }) => id === sort)?.label} sort align="end">
        {sort !== "newest" && <button className="verified-filter-clear" type="button" data-close-popover aria-label="Clear sort" onClick={() => { setSort("newest"); setLimit(12) }}>Clear</button>}
        <div className="verified-sort-options" role="listbox" aria-label="Sort articles">{ARTICLE_SORTS.map(({ id, label }) => <button key={id} type="button" role="option" aria-selected={sort === id} data-close-popover className="verified-sort-option" onClick={() => { setSort(id); setLimit(12) }}>{label}</button>)}</div>
      </FilterPopover></div></div>
      {featured ? <><article className="verified-journal-featured"><Link to="/blogs/research/$handle" params={{handle:featured.handle}} className="verified-journal-card-media" aria-label={`Read ${featured.title}`}><ArticleMedia article={featured} eager /></Link><div>{featured.tags[0] && <span className="verified-journal-tag">{featured.tags[0]}</span>}<h2><Link to="/blogs/research/$handle" params={{handle:featured.handle}}>{featured.title}</Link></h2><div><ArticleMeta article={featured}/><p>{featured.seo.description}</p><Link to="/blogs/research/$handle" params={{handle:featured.handle}} className="verified-button">Read Full Article</Link></div></div></article><div className="verified-journal-grid">{rest.slice(0,limit).map(article => <ArticleCard key={article.id} article={article} />)}</div>{rest.length > limit && <button className="verified-journal-more" onClick={() => setLimit(value=>value+12)}>Load more articles</button>}</> : <p>No articles available.</p>}
    </section><VerifiedSupport />
  </div>
}

export const VerifiedArticle = ({ article, articles, bodyHtml }: { article: ShopifyResearchArticle; articles: ResearchArticleSummary[]; bodyHtml: string }) => {
  const related = articles.filter(item=>item.handle !== article.handle).slice(0,4)
  return <article className="verified-editorial" data-theme-page="article"><header className="verified-editorial-hero"><ArticleMedia article={article} eager /><div><Link to="/blogs/research" className="verified-journal-tag">{article.tags[0] || "Research"}</Link><h1>{article.title}</h1><ArticleMeta article={article}/></div></header><div className="verified-editorial-body bluum-article-prose" dangerouslySetInnerHTML={{__html:bodyHtml}} />{related.length > 0 && <section className="verified-editorial-related" aria-labelledby="verified-related-articles"><div className="verified-editorial-related-heading"><h2 id="verified-related-articles">Related <em>Articles</em></h2><Link to="/blogs/research">View all</Link></div><div className="verified-journal-grid">{related.map(item=><ArticleCard key={item.id} article={item}/>)}</div></section>}<VerifiedSupport /></article>
}
