// Kombinasyon tablosu sütunları: Excel anahtarı → etiket (Türkçe çeviri anahtarı), birim ve grup

export interface CombinationColumn {
  key: string;
  label: string;
  unit?: string;
}

export interface CombinationGroup {
  title: string;
  columns: CombinationColumn[];
}

export const COMBINATION_GROUPS: CombinationGroup[] = [
  {
    title: 'Genel',
    columns: [
      { key: 'Hp', label: 'Beygir gücü', unit: 'HP' },
      { key: 'ModelName', label: 'Model adı' },
      { key: 'WithoutBrand', label: 'Markasız adı' },
      { key: 'NominalCapacity', label: 'Nominal kapasite', unit: 'kW' },
      { key: 'CombinationType', label: 'Kombinasyon tipi' },
      { key: 'LiquidType', label: 'Soğutucu akışkan' }
    ]
  },
  {
    title: 'Performans',
    columns: [
      { key: 'RatedCoolingCapacitykW', label: 'Anma soğutma kapasitesi', unit: 'kW' },
      { key: 'CoolingPowerInputkW', label: 'Soğutma güç tüketimi', unit: 'kW' },
      { key: 'Eer', label: 'EER' },
      { key: 'Seer', label: 'SEER' },
      { key: 'RatedHeatingCapacitykW', label: 'Anma ısıtma kapasitesi', unit: 'kW' },
      { key: 'HeatingPowerInputkW', label: 'Isıtma güç tüketimi', unit: 'kW' },
      { key: 'Cop', label: 'COP' },
      { key: 'Scop', label: 'SCOP' },
      { key: 'CoolingEnergyClass', label: 'Soğutma enerji sınıfı' },
      { key: 'HeatingEnergyClass', label: 'Isıtma enerji sınıfı' }
    ]
  },
  {
    title: 'İç ünite bağlantısı',
    columns: [
      { key: 'MaxConnectedIdu', label: 'Maks. bağlanabilir iç ünite' },
      { key: 'MaxIduinAllSystem', label: 'Sistemde maks. iç ünite' },
      { key: 'MinCombinationRatio', label: 'Min. kombinasyon oranı', unit: '%' },
      { key: 'MaxCombinationRatio', label: 'Maks. kombinasyon oranı', unit: '%' },
      { key: 'MinCombinationRatioForOnlyOneIdu', label: 'Tek iç ünitede min. kombinasyon oranı', unit: '%' },
      { key: 'MaxCombinationRatioForOnlyOneIdu', label: 'Tek iç ünitede maks. kombinasyon oranı', unit: '%' }
    ]
  },
  {
    title: 'Borulama limitleri',
    columns: [
      { key: 'MaxTotalPipingLengthm', label: 'Maks. toplam boru uzunluğu', unit: 'm' },
      { key: 'MaxEquivPipingLengthm', label: 'Maks. eşdeğer boru uzunluğu', unit: 'm' },
      { key: 'MaxActualPipingLengthm', label: 'Maks. gerçek boru uzunluğu', unit: 'm' },
      { key: 'MaxPipingAfterFirstJointWovm', label: 'İlk ayrımdan sonra maks. boru (WOV)', unit: 'm' },
      { key: 'MaxPipingAfterFirstJointWvm', label: 'İlk ayrımdan sonra maks. boru (WV)', unit: 'm' },
      { key: 'MaxPipingAfterSboxm', label: 'SBox sonrası maks. boru', unit: 'm' },
      { key: 'PipeLengthOfIdutoNearestBranchm', label: 'İç üniteden en yakın ayrıma boru', unit: 'm' },
      { key: 'PipeLengthOfIdutoNearestBranchmAfterBranchHeader', label: 'Kollektör sonrası iç üniteden en yakın ayrıma boru', unit: 'm' },
      { key: 'LevelDifferenceOdubelowm', label: 'Kot farkı (dış ünite altta)', unit: 'm' },
      { key: 'LevelDifferenceOduabovem', label: 'Kot farkı (dış ünite üstte)', unit: 'm' },
      { key: 'LevelDifferenceBetweenIduidum', label: 'İç üniteler arası kot farkı', unit: 'm' }
    ]
  },
  {
    title: 'Çalışma aralığı',
    columns: [
      { key: 'OperationRangeCoolingMinc', label: 'Soğutma min.', unit: '°C' },
      { key: 'OperationRangeCoolingMaxc', label: 'Soğutma maks.', unit: '°C' },
      { key: 'OperationRangeHeatingMinc', label: 'Isıtma min.', unit: '°C' },
      { key: 'OperationRangeHeatingMaxc', label: 'Isıtma maks.', unit: '°C' }
    ]
  },
  {
    title: 'Elektrik',
    columns: [
      { key: 'PowerSupply', label: 'Besleme' },
      { key: 'Phase', label: 'Faz' },
      { key: 'Hz', label: 'Frekans', unit: 'Hz' },
      { key: 'VoltageBand', label: 'Gerilim aralığı', unit: 'V' },
      { key: 'MinVoltage', label: 'Min. gerilim', unit: 'V' },
      { key: 'MaxVoltage', label: 'Maks. gerilim', unit: 'V' },
      { key: 'Mca', label: 'Min. devre akımı (MCA)', unit: 'A' },
      { key: 'Toca', label: 'Toplam aşırı akım (TOCA)', unit: 'A' },
      { key: 'Mfa', label: 'Maks. sigorta akımı (MFA)', unit: 'A' },
      { key: 'CompressorsMsc', label: 'Kompresör maks. kalkış akımı (MSC)', unit: 'A' },
      { key: 'CompressorsRla', label: 'Kompresör nominal akımı (RLA)', unit: 'A' },
      { key: 'OfmkW', label: 'Dış fan motoru gücü', unit: 'kW' },
      { key: 'Ofmfla', label: 'Dış fan motoru tam yük akımı', unit: 'A' },
      { key: 'EnergyCableType', label: 'Enerji kablosu tipi' },
      { key: 'EnergyCableThicknessmm', label: 'Enerji kablosu kesiti', unit: 'mm²' },
      { key: 'CommunicationCableType', label: 'Haberleşme kablosu tipi' },
      { key: 'CommunicationCableThicknessmm', label: 'Haberleşme kablosu kesiti', unit: 'mm²' }
    ]
  },
  {
    title: 'Ses, hava ve şarj',
    columns: [
      { key: 'FactoryChargekg', label: 'Fabrika gaz şarjı', unit: 'kg' },
      { key: 'SoundPressureLeveldb', label: 'Ses basınç seviyesi', unit: 'dB' },
      { key: 'SoundPowerLeveldb', label: 'Ses gücü seviyesi', unit: 'dB' },
      { key: 'AirFlowRatem3h', label: 'Hava debisi', unit: 'm³/h' }
    ]
  },
  {
    title: 'Boyut ve ağırlık',
    columns: [
      { key: 'Widthmm', label: 'En', unit: 'mm' },
      { key: 'Heightmm', label: 'Boy', unit: 'mm' },
      { key: 'Depthmm', label: 'Derinlik', unit: 'mm' },
      { key: 'NetWeightkg', label: 'Net ağırlık', unit: 'kg' },
      { key: 'GrossWeightkg', label: 'Brüt ağırlık', unit: 'kg' }
    ]
  },
  {
    title: 'Boru bağlantıları',
    columns: [
      { key: 'LiquidPipemm', label: 'Sıvı borusu', unit: 'mm' },
      { key: 'GasPipemm', label: 'Gaz borusu', unit: 'mm' },
      { key: 'LpgasPipemm', label: 'Alçak basınç gaz borusu', unit: 'mm' },
      { key: 'OilBalancePipemm', label: 'Yağ dengeleme borusu', unit: 'mm' }
    ]
  },
  {
    title: 'AHU ile limitler',
    columns: [
      { key: 'MinCombinationRatioWithAhu', label: 'Min. kombinasyon oranı', unit: '%' },
      { key: 'MaxCombinationRatioWithAhu', label: 'Maks. kombinasyon oranı', unit: '%' },
      { key: 'MaxTotalPipingLengthmWithAhu', label: 'Maks. toplam boru uzunluğu', unit: 'm' },
      { key: 'MaxEquivPipingLengthmWithAhu', label: 'Maks. eşdeğer boru uzunluğu', unit: 'm' },
      { key: 'MaxActualPipingLengthmWithAhu', label: 'Maks. gerçek boru uzunluğu', unit: 'm' },
      { key: 'MaxPipingAfterFirstJointWovmWithAhu', label: 'İlk ayrımdan sonra maks. boru (WOV)', unit: 'm' },
      { key: 'MaxPipingAfterFirstJointWvmWithAhu', label: 'İlk ayrımdan sonra maks. boru (WV)', unit: 'm' },
      { key: 'LevelDifferenceOdubelowmWithAhu', label: 'Kot farkı (dış ünite altta)', unit: 'm' },
      { key: 'LevelDifferenceOduabovemWithAhu', label: 'Kot farkı (dış ünite üstte)', unit: 'm' },
      { key: 'LevelDifferenceBetweenIduidumWithAhu', label: 'İç üniteler arası kot farkı', unit: 'm' }
    ]
  }
];

// Özet tabloda gösterilen sütunlar (geri kalanı satır açılınca gruplar halinde görünür)
export const COMBINATION_SUMMARY: CombinationColumn[] = [
  { key: 'Hp', label: 'HP' },
  { key: 'ModelName', label: 'Model adı' },
  { key: 'WithoutBrand', label: 'Markasız adı' },
  { key: 'NominalCapacity', label: 'Nominal kapasite', unit: 'kW' },
  { key: 'RatedCoolingCapacitykW', label: 'Soğutma', unit: 'kW' },
  { key: 'RatedHeatingCapacitykW', label: 'Isıtma', unit: 'kW' },
  { key: 'Eer', label: 'EER' },
  { key: 'Cop', label: 'COP' },
  { key: 'MaxConnectedIdu', label: 'Maks. iç ünite' },
  { key: 'LiquidType', label: 'Soğutucu' }
];
