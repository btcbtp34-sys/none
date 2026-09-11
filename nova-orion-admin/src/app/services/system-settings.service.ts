import { Injectable, signal } from '@angular/core';

export interface SystemParameterItem {
  id: number;
  key: string;
  name: string;
  category: 'Genel' | 'Güvenlik' | 'Sistem' | 'Entegrasyon';
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  description: string;
}

export interface BackupSnapshotItem {
  id: number;
  name: string;
  size: string;
  createdAt: string;
  type: 'Tam Sistem Yedeği' | 'Veritabanı & Konfigürasyon' | 'Dil & İçerik Yedeği';
  status: 'Başarılı' | 'İşleniyor';
  checksum: string;
}

const PARAMS_STORAGE_KEY = 'nova_orion_system_params';
const BACKUPS_STORAGE_KEY = 'nova_orion_system_backups';

const INITIAL_PARAMETERS: SystemParameterItem[] = [
  {
    id: 1,
    key: 'SESSION_TIMEOUT_MINUTES',
    name: 'Oturum Zaman Aşımı',
    category: 'Güvenlik',
    value: '30',
    type: 'number',
    description: 'Kullanıcı hareketsiz kaldığında oturumun otomatik sonlandırılma süresi (dakika)'
  },
  {
    id: 2,
    key: 'DEFAULT_CURRENCY',
    name: 'Varsayılan Para Birimi',
    category: 'Genel',
    value: 'EUR (€)',
    type: 'select',
    options: ['EUR (€)', 'USD ($)', 'TRY (₺)', 'GBP (£)'],
    description: 'Sistem genelinde teklif ve fiyatlandırma hesaplamalarında kullanılan ana para birimi'
  },
  {
    id: 3,
    key: 'MAX_FILE_UPLOAD_MB',
    name: 'Maksimum Yükleme Boyutu',
    category: 'Sistem',
    value: '25',
    type: 'number',
    description: 'Doküman, teknik şema ve katalog yüklemeleri için izin verilen tek dosya boyutu (MB)'
  },
  {
    id: 4,
    key: 'MAINTENANCE_MODE',
    name: 'Bakım Modu',
    category: 'Sistem',
    value: 'false',
    type: 'boolean',
    description: 'Aktifleştirildiğinde yalnızca Süper Admin kullanıcılar portala erişebilir'
  },
  {
    id: 5,
    key: 'ENABLE_SSO_2FA',
    name: 'İki Adımlı Doğrulama (SSO 2FA)',
    category: 'Güvenlik',
    value: 'true',
    type: 'boolean',
    description: 'Kurumsal tekil oturum açma işlemlerinde e-posta onay kodu zorunluluğu'
  },
  {
    id: 6,
    key: 'API_GATEWAY_URL',
    name: 'API Gateway Adresi',
    category: 'Entegrasyon',
    value: 'https://api.gateway.nova-orion.internal/v2',
    type: 'text',
    description: 'Merkezi mikroservis ve dış sistem senkronizasyon uç noktası adresi'
  }
];

const INITIAL_BACKUPS: BackupSnapshotItem[] = [
  {
    id: 1,
    name: 'backup_full_20260910_0300.tar.gz',
    size: '142.8 MB',
    createdAt: '10.09.2026 03:00',
    type: 'Tam Sistem Yedeği',
    status: 'Başarılı',
    checksum: 'sha256:7f83b1657ff1fc53b92dc18148a1d65d'
  },
  {
    id: 2,
    name: 'backup_db_config_20260909_2300.sql.gz',
    size: '34.2 MB',
    createdAt: '09.09.2026 23:00',
    type: 'Veritabanı & Konfigürasyon',
    status: 'Başarılı',
    checksum: 'sha256:9a58b211a7c5ec843f01931d830b561c'
  },
  {
    id: 3,
    name: 'backup_languages_content_20260908_1200.json.gz',
    size: '8.4 MB',
    createdAt: '08.09.2026 12:00',
    type: 'Dil & İçerik Yedeği',
    status: 'Başarılı',
    checksum: 'sha256:1b6238b1d83c26a8d8e578201297e682'
  }
];

@Injectable({
  providedIn: 'root'
})
export class SystemSettingsService {
  private parametersList = signal<SystemParameterItem[]>(this.loadParameters());
  private backupsList = signal<BackupSnapshotItem[]>(this.loadBackups());

  parameters = this.parametersList.asReadonly();
  backups = this.backupsList.asReadonly();

  private loadParameters(): SystemParameterItem[] {
    try {
      const saved = localStorage.getItem(PARAMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PARAMETERS;
  }

  private loadBackups(): BackupSnapshotItem[] {
    try {
      const saved = localStorage.getItem(BACKUPS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_BACKUPS;
  }

  private persistParams(data: SystemParameterItem[]) {
    try {
      localStorage.setItem(PARAMS_STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  private persistBackups(data: BackupSnapshotItem[]) {
    try {
      localStorage.setItem(BACKUPS_STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  // Parameters CRUD
  addParameter(param: Omit<SystemParameterItem, 'id'>) {
    const current = this.parametersList();
    const newId = current.length > 0 ? Math.max(...current.map(p => p.id)) + 1 : 1;
    const updated = [{ ...param, id: newId }, ...current];
    this.parametersList.set(updated);
    this.persistParams(updated);
  }

  updateParameter(id: number, updated: Partial<SystemParameterItem>) {
    const next = this.parametersList().map(p =>
      p.id === id ? { ...p, ...updated } : p
    );
    this.parametersList.set(next);
    this.persistParams(next);
  }

  deleteParameter(id: number) {
    const next = this.parametersList().filter(p => p.id !== id);
    this.parametersList.set(next);
    this.persistParams(next);
  }

  toggleBooleanParam(id: number) {
    const next = this.parametersList().map(p => {
      if (p.id !== id || p.type !== 'boolean') return p;
      const newVal = p.value === 'true' ? 'false' : 'true';
      return { ...p, value: newVal };
    });
    this.parametersList.set(next);
    this.persistParams(next);
  }

  // Backup & Restore
  createBackup(type: 'Tam Sistem Yedeği' | 'Veritabanı & Konfigürasyon' | 'Dil & İçerik Yedeği') {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const dateFile = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;

    let ext = 'tar.gz';
    let prefix = 'backup_full';
    let size = '145.2 MB';

    if (type === 'Veritabanı & Konfigürasyon') {
      ext = 'sql.gz';
      prefix = 'backup_db_config';
      size = '35.8 MB';
    } else if (type === 'Dil & İçerik Yedeği') {
      ext = 'json.gz';
      prefix = 'backup_languages';
      size = '9.1 MB';
    }

    const current = this.backupsList();
    const newId = current.length > 0 ? Math.max(...current.map(b => b.id)) + 1 : 1;
    const newBackup: BackupSnapshotItem = {
      id: newId,
      name: `${prefix}_${dateFile}.${ext}`,
      size,
      createdAt: dateStr,
      type,
      status: 'Başarılı',
      checksum: 'sha256:' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
    };

    const updated = [newBackup, ...current];
    this.backupsList.set(updated);
    this.persistBackups(updated);
    return newBackup;
  }

  deleteBackup(id: number) {
    const next = this.backupsList().filter(b => b.id !== id);
    this.backupsList.set(next);
    this.persistBackups(next);
  }
}
