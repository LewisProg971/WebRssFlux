import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, computed, inject, signal } from '@angular/core'

type Pillar = 'all' | 'dev-ia' | 'os-hardware' | 'gaming'

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

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly http = inject(HttpClient)

  protected readonly title = 'SiteFlux RSS'
  protected readonly selectedPillar = signal<Pillar>('all')
  protected readonly items = signal<RssItem[]>([])
  protected readonly generatedAt = signal<string | null>(null)
  protected readonly loading = signal(true)
  protected readonly refreshing = signal(false)
  protected readonly error = signal<string | null>(null)
  protected readonly searchQuery = signal('')
  protected readonly sortMode = signal<SortMode>('newest')

  protected readonly filteredItems = computed(() => {
    const pillar = this.selectedPillar()
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
    this.loadFeed()
  }

  protected setPillar(pillar: Pillar): void {
    this.selectedPillar.set(pillar)
  }

  protected setSearchQuery(value: string): void {
    this.searchQuery.set(value)
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
      return 'Date inconnue'
    }

    return new Intl.DateTimeFormat('fr-FR', {
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
        this.error.set('Impossible de charger les donnees RSS. Lance npm run rss:build puis reessaie.')
        this.loading.set(false)
        this.refreshing.set(false)
      }
    })
  }
}
