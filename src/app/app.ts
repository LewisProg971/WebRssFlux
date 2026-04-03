import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, computed, inject, signal } from '@angular/core'

type Pillar = 'all' | 'dev-ia' | 'os-hardware' | 'gaming'
type FeedFilter = Pillar | 'favorites'
type Language = 'fr' | 'en'
type ErrorKey = 'load-feed'

type Translations = {
  eyebrow: string
  title: string
  subtitle: string
  lastUpdated: string
  categories: Record<Pillar, string>
  favoritesLabel: string
  searchLabel: string
  searchPlaceholder: string
  sortLabel: string
  sortOptions: Record<SortMode, string>
  refreshIdle: string
  refreshBusy: string
  loading: string
  noArticles: string
  articleCount: (count: number) => string
  noSummary: string
  dateUnknown: string
  loadFeedError: string
  languageLabel: string
  noFavorites: string
  bookmarkAdd: string
  bookmarkRemove: string
}

type RssItem = {
  pillar: Exclude<Pillar, 'all'>
  pillarLabel: string
  source: string
  title: string
  link: string
  publishedAt: string | null
  summary: string
}

type FeedPayload = {
  generatedAt: string
  total: number
  items: RssItem[]
}

type SortMode = 'newest' | 'oldest' | 'source'

type SearchSegment = {
  text: string
  match: boolean
}

const languageStorageKey = 'siteflux-rss-language'
const favoritesStorageKey = 'siteflux-rss-favorites'

const translations: Record<Language, Translations> = {
  fr: {
    eyebrow: 'Veille technologique quotidienne',
    title: 'SiteFlux RSS',
    subtitle: 'Un tableau de bord unique pour suivre Dev, IA, OS, hardware et gaming.',
    lastUpdated: 'Derniere mise a jour',
    categories: {
      all: 'Tout',
      'dev-ia': 'Dev & IA',
      'os-hardware': 'OS & Hardware',
      gaming: 'Gaming',
    },
    favoritesLabel: 'Mes Favoris',
    searchLabel: 'Recherche',
    searchPlaceholder: 'Titre, source, resume...',
    sortLabel: 'Tri',
    sortOptions: {
      newest: 'Plus recents',
      oldest: 'Plus anciens',
      source: 'Par source',
    },
    refreshIdle: 'Rafraichir les donnees',
    refreshBusy: 'Rafraichissement...',
    loading: 'Chargement du flux...',
    noArticles: 'Aucun article disponible pour ce filtre.',
    articleCount: (count) => `${count} article${count > 1 ? 's' : ''}`,
    noSummary: 'Aucun resume fourni.',
    dateUnknown: 'Date inconnue',
    loadFeedError: 'Impossible de charger les donnees RSS. Lance npm run rss:build puis reessaie.',
    languageLabel: 'Langue',
    noFavorites: 'Aucun favori enregistré pour le moment.',
    bookmarkAdd: 'Ajouter aux favoris',
    bookmarkRemove: 'Retirer des favoris',
  },
  en: {
    eyebrow: 'Daily tech watch',
    title: 'SiteFlux RSS',
    subtitle: 'A single dashboard to track Dev, AI, OS, hardware and gaming.',
    lastUpdated: 'Last updated',
    categories: {
      all: 'All',
      'dev-ia': 'Dev & AI',
      'os-hardware': 'OS & Hardware',
      gaming: 'Gaming',
    },
    favoritesLabel: 'My Favorites',
    searchLabel: 'Search',
    searchPlaceholder: 'Title, source, summary...',
    sortLabel: 'Sort',
    sortOptions: {
      newest: 'Newest first',
      oldest: 'Oldest first',
      source: 'By source',
    },
    refreshIdle: 'Refresh data',
    refreshBusy: 'Refreshing...',
    loading: 'Loading feed...',
    noArticles: 'No articles available for this filter.',
    articleCount: (count) => `${count} article${count !== 1 ? 's' : ''}`,
    noSummary: 'No summary provided.',
    dateUnknown: 'Unknown date',
    loadFeedError: 'Unable to load RSS data. Run npm run rss:build and try again.',
    languageLabel: 'Language',
    noFavorites: 'No saved favorites yet.',
    bookmarkAdd: 'Add to favorites',
    bookmarkRemove: 'Remove from favorites',
  },
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly http = inject(HttpClient)

  protected readonly language = signal<Language>('fr')
  protected readonly selectedPillar = signal<FeedFilter>('all')
  protected readonly items = signal<RssItem[]>([])
  protected readonly generatedAt = signal<string | null>(null)
  protected readonly loading = signal(true)
  protected readonly refreshing = signal(false)
  protected readonly error = signal<string | null>(null)
  protected readonly searchQuery = signal('')
  protected readonly sortMode = signal<SortMode>('newest')
  protected readonly favoriteLinks = signal<string[]>([])

  protected readonly ui = computed(() => translations[this.language()])

  protected readonly filteredItems = computed(() => {
    const pillar = this.selectedPillar()
    if (pillar === 'favorites') {
      const favorites = this.favoriteLinks()
      return this.items().filter((item) => favorites.includes(item.link))
    }

    if (pillar === 'all') {
      return this.items()
    }

    return this.items().filter((item) => item.pillar === pillar)
  })

  protected readonly displayedItems = computed(() => {
    const query = this.searchQuery().trim().toLowerCase()
    const sortMode = this.sortMode()

    const searched = query
      ? this.filteredItems().filter((item) => {
          const text = `${item.title} ${item.source} ${item.summary}`.toLowerCase()
          return text.includes(query)
        })
      : this.filteredItems()

    return [...searched].sort((left, right) => {
      if (sortMode === 'source') {
        const compareSource = left.source.localeCompare(right.source, 'fr')
        if (compareSource !== 0) {
          return compareSource
        }
      }

      const leftDate = left.publishedAt ? Date.parse(left.publishedAt) : 0
      const rightDate = right.publishedAt ? Date.parse(right.publishedAt) : 0

      if (sortMode === 'oldest') {
        return leftDate - rightDate
      }

      return rightDate - leftDate
    })
  })

  constructor() {
    this.language.set(this.readStoredLanguage())
    this.favoriteLinks.set(this.readStoredFavorites())
    this.loadFeed()
  }

  protected setPillar(pillar: FeedFilter): void {
    this.selectedPillar.set(pillar)
  }

  protected setLanguage(language: Language): void {
    this.language.set(language)
    this.writeStoredLanguage(language)
  }

  protected setSearchQuery(value: string): void {
    this.searchQuery.set(value)
  }

  protected toggleFavorite(item: RssItem): void {
    const currentFavorites = this.favoriteLinks()
    const isFavorite = currentFavorites.includes(item.link)
    const nextFavorites = isFavorite
      ? currentFavorites.filter((link) => link !== item.link)
      : [...currentFavorites, item.link]

    this.favoriteLinks.set(nextFavorites)
    this.writeStoredFavorites(nextFavorites)
  }

  protected isFavorite(item: RssItem): boolean {
    return this.favoriteLinks().includes(item.link)
  }

  protected setSortMode(value: string): void {
    if (value === 'newest' || value === 'oldest' || value === 'source') {
      this.sortMode.set(value)
    }
  }

  protected refreshData(): void {
    this.loadFeed(false)
  }

  protected formatDate(value: string | null): string {
    if (!value) {
      return this.ui().dateUnknown
    }

    return new Intl.DateTimeFormat(this.language() === 'fr' ? 'fr-FR' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value))
  }

  private loadFeed(showLoadingState = true): void {
    if (showLoadingState) {
      this.loading.set(true)
    } else {
      this.refreshing.set(true)
    }

    this.error.set(null)

    this.http.get<FeedPayload>(`assets/data.json?t=${Date.now()}`).subscribe({
      next: (payload) => {
        this.items.set(payload.items ?? [])
        this.generatedAt.set(payload.generatedAt ?? null)
        this.loading.set(false)
        this.refreshing.set(false)
      },
      error: () => {
        this.error.set(this.ui().loadFeedError)
        this.loading.set(false)
        this.refreshing.set(false)
      }
    })
  }

  protected categoryLabel(pillar: Pillar): string {
    return this.ui().categories[pillar]
  }

  protected sortOptionLabel(mode: SortMode): string {
    return this.ui().sortOptions[mode]
  }

  protected get articleCountLabel(): string {
    return this.ui().articleCount(this.displayedItems().length)
  }

  protected searchSegments(value: string): SearchSegment[] {
    const query = this.searchQuery().trim()
    if (!query) {
      return [{ text: value, match: false }]
    }

    const pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${pattern})`, 'ig')
    return value.split(regex).filter(Boolean).map((segment) => ({
      text: segment,
      match: segment.toLowerCase() === query.toLowerCase(),
    }))
  }

  private readStoredLanguage(): Language {
    if (typeof window === 'undefined') {
      return 'fr'
    }

    const storedLanguage = window.localStorage.getItem(languageStorageKey)
    return storedLanguage === 'en' ? 'en' : 'fr'
  }

  private writeStoredLanguage(language: Language): void {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(languageStorageKey, language)
  }

  private readStoredFavorites(): string[] {
    if (typeof window === 'undefined') {
      return []
    }

    const storedFavorites = window.localStorage.getItem(favoritesStorageKey)
    if (!storedFavorites) {
      return []
    }

    try {
      const parsedFavorites = JSON.parse(storedFavorites)
      return Array.isArray(parsedFavorites)
        ? parsedFavorites.filter((value): value is string => typeof value === 'string')
        : []
    } catch {
      return []
    }
  }

  private writeStoredFavorites(favorites: string[]): void {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(favoritesStorageKey, JSON.stringify(favorites))
  }
}
