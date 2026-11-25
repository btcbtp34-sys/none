import {
  ActionType,
  FieldDefinition,
  OperatorOption,
  RuleCategory,
  RuleDefinition,
  RuleStatus,
  SimulationContext,
  TestPreset,
  ValidationType
} from './dogrulama.model';

// Doğrulama Motoru katalogları ve örnek veriler. Etiketler Türkçe çeviri anahtarıdır (dogrulama.i18n.ts).

export const FIELD_DEFINITIONS: FieldDefinition[] = [
  // --- Ürün bilgileri ---
  {
    id: 'brand',
    name: 'Marka',
    category: 'product',
    dataType: 'select',
    // Seçenekler Sistem Yönetimi > Markalar'dan gelir (ValidationRuleService.fieldOptions)
    description: 'Doğrulamanın uygulanacağı ürün markası',
    defaultValue: 'NOVA'
  },
  {
    id: 'productFamily',
    name: 'Ürün Ailesi',
    category: 'product',
    dataType: 'select',
    options: [
      { label: 'AF5300A', value: 'AF5300A' },
      { label: 'AF5300AC', value: 'AF5300AC' },
      { label: 'AF5301A', value: 'AF5301A' },
      { label: 'AF5301AC', value: 'AF5301AC' },
      { label: 'VRF-MAX Commercial', value: 'VRF_MAX' },
      { label: 'SCAC-PRO Inverter', value: 'SCAC_PRO' },
      { label: 'ECO-MULTI Home', value: 'ECO_MULTI' },
      { label: 'NEO-SPLIT Eco', value: 'NEO_SPLIT' },
      { label: 'CHILLER-V2 Heavy', value: 'CHILLER_V2' }
    ],
    description: 'Cihazın ait olduğu ürün serisi/ailesi',
    defaultValue: 'AF5300A'
  },
  {
    id: 'productModel',
    name: 'Ürün Modeli',
    category: 'product',
    dataType: 'select',
    options: [
      { label: 'AF-09K (9K BTU)', value: 'AF-09K' },
      { label: 'AF-12K (12K BTU)', value: 'AF-12K' },
      { label: 'AF-18K (18K BTU)', value: 'AF-18K' },
      { label: 'AF-24K (24K BTU)', value: 'AF-24K' },
      { label: 'AF-36K (36K BTU)', value: 'AF-36K' },
      { label: 'AF-48K (48K BTU)', value: 'AF-48K' },
      { label: 'AF-60K (60K BTU)', value: 'AF-60K' }
    ],
    description: 'Doğrulanacak iç veya dış ünite model kodu',
    defaultValue: 'AF-18K'
  },
  {
    id: 'productType',
    name: 'Ürün Tipi',
    category: 'product',
    dataType: 'select',
    options: [
      { label: 'İç Ünite (IDU)', value: 'IDU' },
      { label: 'Dış Ünite (ODU)', value: 'ODU' },
      { label: 'Dağıtım Kutusu (MCU)', value: 'MCU' },
      { label: 'Kontrol Kiti & Aksesuar', value: 'KIT' }
    ],
    description: 'Ekipman tipi',
    defaultValue: 'IDU'
  },
  {
    id: 'capacity',
    name: 'Kapasite',
    category: 'product',
    dataType: 'number',
    unit: 'kW',
    description: 'Ekipmanın nominal soğutma/ısıtma kapasitesi',
    defaultValue: 14
  },

  // --- Sistem ve borulama bilgileri ---
  {
    id: 'climateSystem',
    name: 'İklimlendirme Sistemi',
    category: 'system',
    dataType: 'select',
    options: [
      { label: 'SCAC (Ticari Split / Kaset)', value: 'SCAC' },
      { label: 'VRF (Değişken Debili)', value: 'VRF' },
      { label: 'Multi-Split', value: 'MULTI_SPLIT' },
      { label: 'Chiller & Fancoil', value: 'CHILLER' },
      { label: 'Isı Pompası', value: 'HEAT_PUMP' }
    ],
    description: 'Sistem mimari tipi',
    defaultValue: 'VRF'
  },
  {
    id: 'oduPosition',
    name: 'Dış Ünite Konumu',
    category: 'system',
    dataType: 'select',
    options: [
      { label: 'İç ünitelerin üzerinde (ABOVE_IDU)', value: 'ABOVE_IDU' },
      { label: 'İç ünitelerin altında (BELOW_IDU)', value: 'BELOW_IDU' },
      { label: 'İç ünitelerle aynı seviyede (odu_equal_idu)', value: 'odu_equal_idu' }
    ],
    description: 'Dış ünitenin iç ünitelere göre düşey konumu',
    defaultValue: 'ABOVE_IDU'
  },
  {
    id: 'iduPosition',
    name: 'İç Ünite Konumu',
    category: 'system',
    dataType: 'select',
    options: [
      { label: 'Kat 1 (FLOOR_1)', value: 'FLOOR_1' },
      { label: 'Kat 2 (FLOOR_2)', value: 'FLOOR_2' },
      { label: 'Çatı Katı (ROOF)', value: 'ROOF' },
      { label: 'Asma Tavan (CEILING)', value: 'CEILING' },
      { label: 'Duvar Montaj (WALL_MOUNT)', value: 'WALL_MOUNT' }
    ],
    description: 'İç ünitenin montaj konumu',
    defaultValue: 'CEILING'
  },
  {
    id: 'distance',
    name: 'Mesafe (Dış Ünite - İç Ünite)',
    category: 'system',
    dataType: 'number',
    unit: 'm',
    description: 'Dış ünite ile en uzak iç ünite arasındaki toplam hat mesafesi',
    defaultValue: 45
  },
  {
    id: 'distanceBetweenIdu',
    name: 'İç Üniteler Arası Mesafe',
    category: 'system',
    dataType: 'number',
    unit: 'm',
    description: 'İki iç ünite arasındaki maksimum düşey veya yatay mesafe',
    defaultValue: 18
  },
  {
    id: 'heightDifference',
    name: 'Yükseklik Farkı',
    category: 'system',
    dataType: 'number',
    unit: 'm',
    description: 'Dış ünite ile iç ünite arasındaki kot farkı',
    defaultValue: 25
  },
  {
    id: 'pipeLength',
    name: 'Boru Uzunluğu',
    category: 'system',
    dataType: 'number',
    unit: 'm',
    description: 'Toplam eşdeğer soğutucu akışkan boru hattı uzunluğu',
    defaultValue: 80
  },
  {
    id: 'refrigerantType',
    name: 'Soğutucu Gaz Tipi',
    category: 'system',
    dataType: 'select',
    options: [
      { label: 'R32 (Düşük GWP)', value: 'R32' },
      { label: 'R410A (Standart)', value: 'R410A' },
      { label: 'R134a (Orta Basınç)', value: 'R134a' },
      { label: 'R290 (Propan - Doğal)', value: 'R290' }
    ],
    description: 'Sistemde kullanılan soğutucu akışkan',
    defaultValue: 'R410A'
  },
  {
    id: 'pipeDiameter',
    name: 'Boru Çapı',
    category: 'system',
    dataType: 'select',
    options: [
      { label: '1/4" (6.35 mm)', value: '1/4' },
      { label: '3/8" (9.52 mm)', value: '3/8' },
      { label: '1/2" (12.7 mm)', value: '1/2' },
      { label: '5/8" (15.88 mm)', value: '5/8' },
      { label: '3/4" (19.05 mm)', value: '3/4' },
      { label: '7/8" (22.22 mm)', value: '7/8' },
      { label: '1-1/8" (28.58 mm)', value: '1-1/8' }
    ],
    description: 'Ana gaz ve sıvı boru çapı',
    defaultValue: '5/8'
  },
  {
    id: 'maxConnectedIdu',
    name: 'Bağlı İç Ünite Adedi',
    category: 'system',
    dataType: 'number',
    unit: 'adet',
    description: 'Sisteme bağlı toplam iç ünite sayısı',
    defaultValue: 6
  },
  {
    id: 'powerSupply',
    name: 'Besleme Gerilimi',
    category: 'system',
    dataType: 'select',
    options: [
      { label: '220-240V, 1 Faz, 50Hz', value: '220V_1PH' },
      { label: '380-415V, 3 Faz, 50Hz', value: '380V_3PH' }
    ],
    description: 'Şebeke elektrik besleme standardı',
    defaultValue: '380V_3PH'
  },

  // --- Dinamik sistem parametreleri ---
  {
    id: 'limit',
    name: 'Dinamik Limit (limit)',
    category: 'system',
    dataType: 'number',
    unit: 'm',
    isParameter: true,
    description: 'Sistem konfigürasyonundan gelen izin verilen mesafe sınırı',
    defaultValue: 15
  },
  {
    id: 'maxOilReturnLift',
    name: 'Maks. Yağ Dönüşü Yüksekliği (maxOilReturnLift)',
    category: 'system',
    dataType: 'number',
    unit: 'm',
    isParameter: true,
    description: 'Yağ kapanı olmadan izin verilen maksimum kot farkı',
    defaultValue: 20
  }
];

export const OPERATOR_DEFINITIONS: OperatorOption[] = [
  { value: 'equals', label: 'Eşittir', symbol: '=', description: 'Alan değeri belirtilen değere eşittir' },
  { value: 'notEquals', label: 'Eşit Değildir', symbol: '!=', description: 'Alan değeri belirtilen değerden farklıdır' },
  { value: 'greaterThan', label: 'Büyüktür', symbol: '>', description: 'Alan değeri belirtilen değerden büyüktür' },
  { value: 'lessThan', label: 'Küçüktür', symbol: '<', description: 'Alan değeri belirtilen değerden küçüktür' },
  { value: 'greaterThanOrEqual', label: 'Büyük veya Eşittir', symbol: '>=', description: 'Alan değeri belirtilen değerden büyük veya eşittir' },
  { value: 'lessThanOrEqual', label: 'Küçük veya Eşittir', symbol: '<=', description: 'Alan değeri belirtilen değerden küçük veya eşittir' },
  { value: 'in', label: 'İçindedir (IN)', symbol: 'IN [ ]', description: 'Alan değeri listedeki değerlerden birine eşittir' },
  { value: 'notIn', label: 'İçinde Değildir (NOT IN)', symbol: 'NOT IN [ ]', description: 'Alan değeri listedeki değerlerin hiçbirine eşit değildir' },
  { value: 'between', label: 'Aralığındadır (BETWEEN)', symbol: '↔', description: 'Alan değeri alt ve üst sınır arasındadır (dahil)' },
  { value: 'contains', label: 'İçerir', symbol: '⊃', description: 'Metin alanı belirtilen ifadeyi içerir' }
];

// Koşullarda sabit değer yerine kullanılabilen dinamik parametreler
export const PARAMETER_OPTIONS: { value: string; label: string }[] = [
  { value: 'limit', label: 'Dinamik Limit (limit)' },
  { value: 'maxOilReturnLift', label: 'Maks. Yağ Dönüşü Yüksekliği (maxOilReturnLift)' }
];

export interface ActionTemplate {
  type: ActionType;
  label: string;
  description: string;
  defaultMessage: string;
  icon: string;
  tone: 'error' | 'warning' | 'info' | 'block' | 'set' | 'message';
}

export const ACTION_TEMPLATES: ActionTemplate[] = [
  { type: 'giveError', label: 'Hata Ver', description: 'Kritik hata gösterir ve tasarım onayını durdurur', defaultMessage: 'İzin verilen maksimum limit aşıldı ({limit} m).', icon: 'alert-error', tone: 'error' },
  { type: 'giveWarning', label: 'Uyarı Ver', description: 'Mühendise dikkat gerektiren bir uyarı gösterir', defaultMessage: 'Kot farkı 20 m üzerindedir ({heightDifference} m). Yağ dönüşünü kontrol ediniz.', icon: 'alert-warning', tone: 'warning' },
  { type: 'giveInfo', label: 'Bilgilendirme Göster', description: 'Teknik tavsiye veya montaj notu gösterir', defaultMessage: 'Bu konfigürasyon için Teknik El Kitabı Bölüm 4.2 geçerlidir.', icon: 'alert-info', tone: 'info' },
  { type: 'blockSelection', label: 'Seçimi Kilitle', description: 'Belirli bir buton veya ekipman seçimini kilitler', defaultMessage: 'Kritik limit aşımı nedeniyle bu seçim kilitlenmiştir.', icon: 'lock-closed', tone: 'block' },
  { type: 'setFieldValue', label: 'Alan Değeri Ata', description: 'Bir alana otomatik değer veya zorunlu aksesuar atar', defaultMessage: 'Sisteme zorunlu aksesuar kiti otomatik eklendi.', icon: 'settings', tone: 'set' },
  { type: 'showMessage', label: 'Özel Mesaj Penceresi', description: 'Açılır pencerede özel bildirim gösterir', defaultMessage: 'Doğrulama uyarısı detayları için teknik dokümana başvurunuz.', icon: 'mail', tone: 'message' }
];

export const MESSAGE_TEMPLATES: { id: string; title: string; text: string }[] = [
  {
    id: 'msg_idu_limit',
    title: 'İç Ünite Yükseklik Limiti Aşımı',
    text: "ODU ve IDU aynı seviyedeyse, IDU'lar arasındaki yükseklik farkı izin verilen maksimum değeri ({limit} m) aşamaz. SCAC sistemlerinde bu kontrol uygulanmaz."
  },
  {
    id: 'msg_oil_return',
    title: 'Yağ Dönüşü Uyarısı',
    text: 'Seçilen ürün ailesinde dış ünite, iç ünitelerin 20 metreden fazla üzerinde konumlandırılmıştır ({heightDifference} m). Kompresör ömrü için yağ dönüşü gereksinimlerini kontrol ediniz.'
  },
  {
    id: 'msg_r32_pipe',
    title: 'R32 Gazı ve Boru Limiti Bildirimi',
    text: 'VRF sistemlerinde R32 soğutucu akışkan ile 100 metreyi aşan hat uzunluklarında ({pipeLength} m) hat basınç kaybı ve ilave gaz şarjı tablosunu inceleyiniz.'
  },
  {
    id: 'msg_hydraulic_block',
    title: 'Hidrolik Onay Engelleme',
    text: 'Kritik hidrolik ve yağ dağılım dengesizliği riski nedeniyle borulama tasarımı onaylanamaz.'
  },
  {
    id: 'msg_capacity_check',
    title: 'Kapasite ve Kot Farkı Uyumu',
    text: '28 kW üzeri sistemlerde 30 m üzeri düşey hat montajı için ilave yağ kapanı ve yağ pompası zorunludur.'
  }
];

// Mesajlara {anahtar} olarak eklenebilen simülasyon değerleri
export const MESSAGE_PARAMETERS: { key: string; label: string }[] = [
  { key: 'limit', label: 'Dinamik Limit (limit)' },
  { key: 'heightDifference', label: 'Yükseklik Farkı' },
  { key: 'pipeLength', label: 'Boru Uzunluğu' },
  { key: 'distanceBetweenIdu', label: 'İç Üniteler Arası Mesafe' },
  { key: 'brand', label: 'Marka' },
  { key: 'productFamily', label: 'Ürün Ailesi' },
  { key: 'climateSystem', label: 'İklimlendirme Sistemi' }
];

export const CATEGORY_LABELS: Record<RuleCategory, string> = {
  sizingPiping: 'Boyutlandırma & Borulama',
  capacityPower: 'Kapasite & Güç',
  safetyCompliance: 'Emniyet & Uyumluluk',
  systemArchitecture: 'Sistem Mimarisi',
  refrigerant: 'Soğutucu Akışkan',
  general: 'Genel Doğrulama'
};

export const VALIDATION_TYPE_LABELS: Record<ValidationType, string> = {
  error: 'Hata',
  warning: 'Uyarı',
  info: 'Bilgi',
  block: 'Engelleme'
};

export const STATUS_LABELS: Record<RuleStatus, string> = {
  Active: 'Aktif',
  Draft: 'Taslak',
  Inactive: 'Pasif'
};

export const CHANNELS: { key: string; label: string }[] = [
  { key: 'b2bPortal', label: 'B2B Seçim Portalı' },
  { key: 'engineeringModule', label: 'Mühendislik Hesaplama Modülü' },
  { key: 'mobileService', label: 'Mobil Servis & Devreye Alma' },
  { key: 'quoteEngine', label: 'ERP & Teklif Motoru' },
  { key: 'fieldConfigurator', label: 'Saha Konfigüratörü' }
];

export const DEFAULT_SIMULATION_CONTEXT: SimulationContext = {
  brand: 'NOVA',
  productFamily: 'VRF_MAX',
  productModel: 'AF-24K',
  productType: 'IDU',
  capacity: 14,
  climateSystem: 'VRF',
  oduPosition: 'odu_equal_idu',
  iduPosition: 'CEILING',
  distance: 35,
  distanceBetweenIdu: 18,
  heightDifference: 12,
  pipeLength: 65,
  refrigerantType: 'R410A',
  pipeDiameter: '5/8',
  maxConnectedIdu: 4,
  powerSupply: '380V_3PH',
  limit: 15,
  maxOilReturnLift: 20
};

export const INITIAL_RULES: RuleDefinition[] = [
  {
    id: 'RULE-VAL-001',
    code: 'VAL_IDU_HEIGHT_LIMIT',
    name: 'İç Ünite Yükseklik Farkı Kontrolü',
    description: 'Dış ünite ve iç ünitelerin aynı kotta olması durumunda iç üniteler arası maksimum yükseklik farkının aşılmasını engeller.',
    brand: 'NOVA',
    category: 'sizingPiping',
    validationType: 'error',
    status: 'Active',
    priority: 95,
    version: '1.2.0',
    lastModified: '2026-10-09T11:45:00',
    author: 'Ahmet K.',
    stopOnFirstFail: true,
    validFrom: '2026-01-01',
    validTo: '2027-12-31',
    applicableChannels: ['b2bPortal', 'engineeringModule'],
    rootConditionGroup: {
      id: 'grp_root_001',
      type: 'group',
      name: 'Ana Koşul Grubu',
      operator: 'AND',
      children: [
        { id: 'c_001_brand', type: 'condition', field: 'brand', operator: 'equals', value: 'NOVA', valueType: 'literal' },
        { id: 'c_001_climate', type: 'condition', field: 'climateSystem', operator: 'notEquals', value: 'SCAC', valueType: 'literal' },
        { id: 'c_001_odupos', type: 'condition', field: 'oduPosition', operator: 'equals', value: 'odu_equal_idu', valueType: 'literal' },
        { id: 'c_001_dist', type: 'condition', field: 'distanceBetweenIdu', operator: 'greaterThan', value: 'limit', valueType: 'parameter', unit: 'm' }
      ]
    },
    actions: [
      {
        id: 'act_001_err',
        type: 'giveError',
        title: 'Kritik İç Ünite Yükseklik Limiti Aşıldı',
        message: "ODU ve IDU aynı seviyedeyse, IDU'lar arasındaki yükseklik farkı izin verilen maksimum değeri ({limit} m) aşamaz. SCAC sistemlerinde bu kontrol uygulanmaz.",
        code: 'ERR_IDU_HEIGHT_EXCEEDED'
      },
      {
        id: 'act_001_block',
        type: 'blockSelection',
        title: 'Tasarım Onayını Engelle',
        message: 'Kritik hidrolik ve yağ dağılım dengesizliği riski nedeniyle borulama tasarımı onaylanamaz.',
        blockTarget: 'piping_approval_button'
      }
    ],
    executionStats: { testCount: 142, passCount: 118, failCount: 24, lastTestedAt: '2026-10-09T12:30:00' }
  },
  {
    id: 'RULE-VAL-002',
    code: 'VAL_ODU_ABOVE_OIL_RETURN',
    name: 'Dış Ünite Üstte – Yağ Dönüşü Uyarısı',
    description: 'Dış ünitenin iç ünitelerin 20 metreden fazla yukarısında yer alması halinde yağ dönüş kapanı gereksinimini denetler.',
    brand: 'NOVA',
    category: 'safetyCompliance',
    validationType: 'warning',
    status: 'Active',
    priority: 85,
    version: '2.0.1',
    lastModified: '2026-10-08T16:20:00',
    author: 'Elif Y.',
    stopOnFirstFail: false,
    validFrom: '2026-01-01',
    validTo: '2028-12-31',
    applicableChannels: ['b2bPortal', 'mobileService', 'quoteEngine'],
    rootConditionGroup: {
      id: 'grp_root_002',
      type: 'group',
      name: 'Ana Koşul Grubu',
      operator: 'AND',
      children: [
        {
          id: 'grp_nested_002_family',
          type: 'group',
          name: 'Hedef Ürün Ailesi Grubu',
          operator: 'OR',
          children: [
            { id: 'c_002_fam1', type: 'condition', field: 'productFamily', operator: 'equals', value: 'AF5300A', valueType: 'literal' },
            { id: 'c_002_fam2', type: 'condition', field: 'productFamily', operator: 'equals', value: 'AF5300AC', valueType: 'literal' },
            { id: 'c_002_fam3', type: 'condition', field: 'productFamily', operator: 'equals', value: 'AF5301A', valueType: 'literal' },
            { id: 'c_002_fam4', type: 'condition', field: 'productFamily', operator: 'equals', value: 'AF5301AC', valueType: 'literal' }
          ]
        },
        { id: 'c_002_odupos', type: 'condition', field: 'oduPosition', operator: 'equals', value: 'ABOVE_IDU', valueType: 'literal' },
        { id: 'c_002_height', type: 'condition', field: 'heightDifference', operator: 'greaterThan', value: 20, valueType: 'literal', unit: 'm' }
      ]
    },
    actions: [
      {
        id: 'act_002_warn',
        type: 'giveWarning',
        title: 'Yağ Dönüş Kapanı Gereksinimi',
        message: 'Seçilen ürün ailesinde dış ünite, iç ünitelerin 20 metreden fazla üzerinde konumlandırılmıştır ({heightDifference} m). Kompresör ömrü için yağ dönüşü gereksinimlerini kontrol ediniz.',
        code: 'WARN_OIL_RETURN_TRAP_REQUIRED'
      },
      {
        id: 'act_002_setfield',
        type: 'setFieldValue',
        title: 'Otomatik Aksesuar Ekle',
        message: 'Teklif listesine zorunlu yağ kapanı kiti (KIT-OT-20) eklendi.',
        targetField: 'oilTrapAccessoryKit',
        targetValue: 'KIT_OIL_TRAP_R32'
      }
    ],
    executionStats: { testCount: 310, passCount: 205, failCount: 105, lastTestedAt: '2026-10-09T09:15:00' }
  },
  {
    id: 'RULE-VAL-003',
    code: 'VAL_VRF_PIPE_LENGTH_R32',
    name: 'VRF R32 Maksimum Borulama ve Gaz Şarj Sınırı',
    description: 'Orion VRF sistemlerinde R32 gazı ile 100 metreyi aşan boru hatlarında güvenlik ve ilave şarj kontrolü yapar.',
    brand: 'ORION',
    category: 'refrigerant',
    validationType: 'warning',
    status: 'Active',
    priority: 80,
    version: '1.0.0',
    lastModified: '2026-10-07T14:10:00',
    author: 'Mehmet T.',
    stopOnFirstFail: false,
    validFrom: '2026-02-01',
    validTo: '2027-12-31',
    applicableChannels: ['b2bPortal', 'engineeringModule'],
    rootConditionGroup: {
      id: 'grp_root_003',
      type: 'group',
      name: 'Ana Koşul Grubu',
      operator: 'AND',
      children: [
        { id: 'c_003_brand', type: 'condition', field: 'brand', operator: 'equals', value: 'ORION', valueType: 'literal' },
        { id: 'c_003_system', type: 'condition', field: 'climateSystem', operator: 'equals', value: 'VRF', valueType: 'literal' },
        { id: 'c_003_refr', type: 'condition', field: 'refrigerantType', operator: 'equals', value: 'R32', valueType: 'literal' },
        { id: 'c_003_pipe', type: 'condition', field: 'pipeLength', operator: 'greaterThan', value: 100, valueType: 'literal', unit: 'm' }
      ]
    },
    actions: [
      {
        id: 'act_003_warn',
        type: 'giveWarning',
        title: 'Maksimum Boru Hattı Sınırı Uyarısı',
        message: 'VRF sistemlerinde R32 soğutucu akışkan ile 100 metreyi aşan hat uzunluklarında ({pipeLength} m) hat basınç kaybı ve ilave gaz şarjı tablosunu inceleyiniz.',
        code: 'WARN_R32_MAX_PIPE_LENGTH'
      }
    ],
    executionStats: { testCount: 64, passCount: 52, failCount: 12, lastTestedAt: '2026-10-08T18:40:00' }
  },
  {
    id: 'RULE-VAL-004',
    code: 'VAL_CAPACITY_OVERLOAD_CHECK',
    name: 'Aşırı Yükseklik ve Kapasite Uyumu',
    description: '28 kW üzeri kapasiteli sistemlerde 30 metreden fazla kot farkı oluşması durumunda ilave yağ pompası zorunluluğunu bildirir.',
    brand: 'BOTH',
    category: 'capacityPower',
    validationType: 'info',
    status: 'Draft',
    priority: 60,
    version: '0.9.0',
    lastModified: '2026-10-06T10:05:00',
    author: 'Doğrulama Ekibi',
    stopOnFirstFail: false,
    validFrom: '2026-03-01',
    validTo: '2028-01-01',
    applicableChannels: ['b2bPortal'],
    rootConditionGroup: {
      id: 'grp_root_004',
      type: 'group',
      name: 'Ana Koşul Grubu',
      operator: 'AND',
      children: [
        { id: 'c_004_cap', type: 'condition', field: 'capacity', operator: 'greaterThan', value: 28, valueType: 'literal', unit: 'kW' },
        { id: 'c_004_height', type: 'condition', field: 'heightDifference', operator: 'greaterThan', value: 30, valueType: 'literal', unit: 'm' }
      ]
    },
    actions: [
      {
        id: 'act_004_info',
        type: 'giveInfo',
        title: 'Özel Borulama Rehberi Bildirimi',
        message: '28 kW üzeri sistemlerde 30 m üzeri düşey hat montajı için Teknik El Kitabı Bölüm 4.2 kriterleri geçerlidir.',
        code: 'INFO_HIGH_LIFT_CAPACITY'
      }
    ],
    executionStats: { testCount: 19, passCount: 19, failCount: 0, lastTestedAt: '2026-10-06T10:15:00' }
  }
];

const presetContext = (overrides: SimulationContext): SimulationContext => ({ ...DEFAULT_SIMULATION_CONTEXT, ...overrides });

export const TEST_PRESETS: TestPreset[] = [
  {
    id: 'preset-1-fail',
    name: 'Kural 1: İç ünite yükseklik aşımı (hata)',
    targetRuleId: 'RULE-VAL-001',
    description: 'Nova, VRF, aynı kot, mesafe 18 m > limit 15 m: kural eşleşir ve hata verir.',
    context: presetContext({ productFamily: 'VRF_MAX', productModel: 'AF-24K', distanceBetweenIdu: 18, heightDifference: 12 })
  },
  {
    id: 'preset-1-pass',
    name: 'Kural 1: Güvenli iç ünite mesafesi (geçerli)',
    targetRuleId: 'RULE-VAL-001',
    description: 'Mesafe (9 m) limitin (15 m) altında kaldığı için kural tetiklenmez.',
    context: presetContext({ productModel: 'AF-18K', capacity: 10, distance: 25, distanceBetweenIdu: 9, heightDifference: 4, pipeLength: 40, pipeDiameter: '1/2', maxConnectedIdu: 3 })
  },
  {
    id: 'preset-1-scac-bypass',
    name: 'Kural 1: SCAC sistemi muafiyeti (atlandı)',
    targetRuleId: 'RULE-VAL-001',
    description: 'SCAC sistemlerinde muafiyet koşulu (İklimlendirme Sistemi != SCAC) devreye girer.',
    context: presetContext({ productFamily: 'SCAC_PRO', productModel: 'AF-36K', capacity: 16, climateSystem: 'SCAC', distance: 40, distanceBetweenIdu: 22, heightDifference: 8, pipeLength: 50, refrigerantType: 'R32', maxConnectedIdu: 1, powerSupply: '220V_1PH' })
  },
  {
    id: 'preset-2-oil-warn',
    name: 'Kural 2: AF5300A yağ kapanı uyarısı',
    targetRuleId: 'RULE-VAL-002',
    description: 'AF5300A, dış ünite üstte, kot farkı 25 m > 20 m: yağ dönüşü uyarısı ve aksesuar ataması.',
    context: presetContext({ productFamily: 'AF5300A', productModel: 'AF-48K', productType: 'ODU', capacity: 22.4, oduPosition: 'ABOVE_IDU', iduPosition: 'FLOOR_1', distance: 60, distanceBetweenIdu: 8, heightDifference: 25, pipeLength: 75, pipeDiameter: '3/4', maxConnectedIdu: 6 })
  },
  {
    id: 'preset-2-oil-safe',
    name: 'Kural 2: Düşük kot farkı (14 m, güvenli)',
    targetRuleId: 'RULE-VAL-002',
    description: 'Kot farkı (14 m) 20 m sınırının altında olduğu için uyarı verilmez.',
    context: presetContext({ productFamily: 'AF5300A', productType: 'ODU', oduPosition: 'ABOVE_IDU', iduPosition: 'FLOOR_2', distance: 30, distanceBetweenIdu: 5, heightDifference: 14, pipeLength: 45 })
  },
  {
    id: 'preset-3-orion-vrf',
    name: 'Kural 3: Orion VRF 120 m boru uzunluğu uyarısı',
    targetRuleId: 'RULE-VAL-003',
    description: 'Orion, VRF, R32, boru uzunluğu 120 m > 100 m: gaz şarj uyarısı.',
    context: presetContext({ brand: 'ORION', productModel: 'AF-60K', productType: 'ODU', capacity: 28, oduPosition: 'ABOVE_IDU', iduPosition: 'FLOOR_1', distance: 85, distanceBetweenIdu: 12, heightDifference: 18, pipeLength: 120, refrigerantType: 'R32', pipeDiameter: '7/8', maxConnectedIdu: 8 })
  }
];

export const getFieldDef = (fieldId: string): FieldDefinition | undefined => FIELD_DEFINITIONS.find(f => f.id === fieldId);

export const getOperatorDef = (op: string): OperatorOption | undefined => OPERATOR_DEFINITIONS.find(o => o.value === op);
