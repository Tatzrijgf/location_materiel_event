import { Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DashboardService, type DashboardChartSlice } from '../../core/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule],
  template: `
    <h1>Tableau de bord</h1>

    <div class="cards">
      @for (indicator of data().indicators; track indicator.label) {
        <mat-card class="stat">
          <mat-card-content>
            <span class="stat-label">{{ indicator.label }}</span>
            <span class="stat-value">{{ indicator.value }}</span>
          </mat-card-content>
        </mat-card>
      }
    </div>

    <h2>{{ data().chartTitle }}</h2>
    @if (data().chart.length === 0) {
      <p>Aucune donnée à afficher.</p>
    } @else {
      <mat-card class="chart-card">
        @for (slice of data().chart; track slice.label) {
          <div class="bar-row">
            <span class="bar-label">{{ slice.label }}</span>
            <div class="bar-track">
              <div class="bar" [style.width.%]="width(slice)"></div>
            </div>
            <span class="bar-value">{{ slice.value }}</span>
          </div>
        }
      </mat-card>
    }
  `,
  styles: [
    `
      .stat {
        text-align: center;
        padding: 0.5rem;
      }
      .stat-label {
        display: block;
        color: #5f6368;
        font-size: 0.875rem;
      }
      .stat-value {
        display: block;
        font-size: 1.75rem;
        font-weight: 600;
        margin-top: 0.25rem;
      }
      .chart-card {
        padding: 1rem;
        max-width: 640px;
      }
      .bar-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }
      .bar-label {
        width: 110px;
        font-size: 0.875rem;
      }
      .bar-track {
        flex: 1;
        height: 14px;
        background: #eceff1;
        border-radius: 7px;
        overflow: hidden;
      }
      .bar {
        height: 100%;
        background: #1565c0;
        border-radius: 7px;
      }
      .bar-value {
        width: 2rem;
        text-align: right;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class Dashboard {
  private readonly dashboard = inject(DashboardService);

  readonly data = computed(() => this.dashboard.build());

  protected width(slice: DashboardChartSlice): number {
    const max = Math.max(...this.data().chart.map((entry) => entry.value), 1);
    return Math.round((slice.value / max) * 100);
  }
}
