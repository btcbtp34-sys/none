import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationRuleService, VeToast } from '../../../services/validation-rule.service';
import { TranslationService } from '../../../services/translation.service';

// Doğrulama Motoru işlem bildirimleri (sağ altta, kendiliğinden kapanır)
@Component({
  selector: 'app-ve-toasts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toasts" aria-live="polite">
      <div *ngFor="let t of ruleService.toasts(); trackBy: trackId" class="toast" [ngClass]="t.type">
        <div class="toast-text">
          <strong>{{ t.title }}</strong>
          <span>{{ t.message }}</span>
        </div>
        <button type="button" (click)="ruleService.dismissToast(t.id)" [attr.aria-label]="tsService.translate('Kapat')">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toasts {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: min(360px, calc(100vw - 32px));
    }
    .toast {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      border-left-width: 4px;
      background: #ffffff;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
      animation: toastIn 0.2s ease;
    }
    .toast.success { border-left-color: #10b981; }
    .toast.error { border-left-color: #e11d48; }
    .toast.warning { border-left-color: #f59e0b; }
    .toast.info { border-left-color: #0ea5e9; }
    .toast-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
    }
    .toast-text strong {
      font-size: 12.5px;
      color: #0f172a;
    }
    .toast-text span {
      font-size: 12px;
      color: #475569;
    }
    .toast button {
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: none; }
    }
  `]
})
export class VeToastsComponent {
  ruleService = inject(ValidationRuleService);
  tsService = inject(TranslationService);

  trackId = (_: number, t: VeToast) => t.id;
}
