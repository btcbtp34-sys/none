import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as go from 'gojs';
import { ProjectService } from '../../services/project.service';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';

export interface PaletteItem {
  category: 'OUTDOOR' | 'INDOOR' | 'CONTROLLER' | 'JOINT';
  nodeType: string;
  name: string;
  code: string;
  coolingCapacity: number; // kW
  heatingCapacity: number; // kW
  imageUrl?: string;
  iconSvg: string;
  color: string;
}

export interface SelectedNodeData {
  key: string;
  text: string;
  code: string;
  category: string;
  coolingCapacity: number;
  heatingCapacity: number;
  imageUrl?: string;
  roomName?: string;
}

@Component({
  selector: 'app-frontend-drawing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './frontend-drawing.component.html',
  styleUrl: './frontend-drawing.component.css'
})
export class FrontendDrawingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('diagramDiv', { static: false }) diagramDiv!: ElementRef<HTMLDivElement>;

  projectService = inject(ProjectService);
  tsService = inject(TranslationService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  diagram: go.Diagram | null = null;

  // Active Project Data
  projectId = signal<string>('PRJ-2026-001');
  projectName = signal<string>('Yeni HVAC Projesi');
  projectCity = signal<string>('İstanbul');
  projectCountry = signal<string>('Türkiye');
  outdoorTemp = signal<string>('33°C / 0°C');
  indoorTemp = signal<string>('24°C / 21°C');

  // Canvas element count
  canvasNodeCount = signal<number>(0);

  // Active Tool Mode: 'SELECT' | 'PIPING' | 'WIRING'
  activeMode = signal<'SELECT' | 'PIPING' | 'WIRING'>('SELECT');

  // Selected Element Info
  selectedElement = signal<SelectedNodeData | null>(null);

  // Reports Modal
  showReportsModal = signal<boolean>(false);
  notificationMessage = signal<string>('');

  // Palette Categories (Default to INDOOR, no ALL option)
  activePaletteTab = signal<'INDOOR' | 'OUTDOOR' | 'JOINT' | 'CONTROLLER'>('INDOOR');

  paletteItems: PaletteItem[] = [
    // Outdoor Units
    {
      category: 'OUTDOOR',
      nodeType: 'OUTDOOR',
      name: 'VRF Modüler Dış Ünite',
      code: 'VRF-MOD-28kW',
      coolingCapacity: 28.0,
      heatingCapacity: 31.5,
      color: '#0284c7',
      imageUrl: '/images/vrf_outdoor.jpg',
      iconSvg: 'outdoor'
    },
    {
      category: 'OUTDOOR',
      nodeType: 'OUTDOOR',
      name: 'VRF Mini Dış Ünite',
      code: 'VRF-MINI-14kW',
      coolingCapacity: 14.0,
      heatingCapacity: 16.0,
      color: '#0369a1',
      imageUrl: '/images/vrf_outdoor.jpg',
      iconSvg: 'outdoor'
    },
    // Indoor Units
    {
      category: 'INDOOR',
      nodeType: 'INDOOR',
      name: '4 Yönlü Kaset',
      code: 'CAS-4W-5.6kW',
      coolingCapacity: 5.6,
      heatingCapacity: 6.3,
      color: '#059669',
      imageUrl: '/images/indoor_cassette.jpg',
      iconSvg: 'cassette'
    },
    {
      category: 'INDOOR',
      nodeType: 'INDOOR',
      name: 'Kanallı Tip',
      code: 'DUCT-MED-7.1kW',
      coolingCapacity: 7.1,
      heatingCapacity: 8.0,
      color: '#10b981',
      imageUrl: '/images/indoor_ducted.jpg',
      iconSvg: 'ducted'
    },
    {
      category: 'INDOOR',
      nodeType: 'INDOOR',
      name: 'Duvar Tipi',
      code: 'WALL-SLIM-3.6kW',
      coolingCapacity: 3.6,
      heatingCapacity: 4.0,
      color: '#0d9488',
      imageUrl: '/images/indoor_wall.jpg',
      iconSvg: 'wall'
    },
    {
      category: 'INDOOR',
      nodeType: 'INDOOR',
      name: 'Döşeme / Tavan Tipi',
      code: 'FLR-CEIL-9.0kW',
      coolingCapacity: 9.0,
      heatingCapacity: 10.0,
      color: '#14b8a6',
      imageUrl: '/images/indoor_cassette.jpg',
      iconSvg: 'floor'
    },
    // Joint / Branching
    {
      category: 'JOINT',
      nodeType: 'JOINT',
      name: 'Refnet Branşman',
      code: 'REF-Y-22A',
      coolingCapacity: 0,
      heatingCapacity: 0,
      color: '#d97706',
      iconSvg: 'joint'
    },
    // Controllers
    {
      category: 'CONTROLLER',
      nodeType: 'CONTROLLER',
      name: 'Kablolu Kumanda',
      code: 'CTL-TOUCH-WIRED',
      coolingCapacity: 0,
      heatingCapacity: 0,
      color: '#7c3aed',
      imageUrl: '/images/hvac_controller.jpg',
      iconSvg: 'controller'
    },
    {
      category: 'CONTROLLER',
      nodeType: 'CONTROLLER',
      name: 'Merkezi Dokunmatik Panel',
      code: 'BMS-CENTRAL-TOUCH',
      coolingCapacity: 0,
      heatingCapacity: 0,
      color: '#9333ea',
      imageUrl: '/images/hvac_controller.jpg',
      iconSvg: 'bms'
    }
  ];

  get filteredPaletteItems(): PaletteItem[] {
    const tab = this.activePaletteTab();
    return this.paletteItems.filter(item => item.category === tab);
  }

  ngAfterViewInit(): void {
    // Read route params if available
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.projectId.set(params['id']);
      }
    });

    this.route.queryParams.subscribe(qp => {
      if (qp['name']) this.projectName.set(qp['name']);
      if (qp['code']) this.projectId.set(qp['code']);
      if (qp['city']) this.projectCity.set(qp['city']);
      if (qp['country']) this.projectCountry.set(qp['country']);
      if (qp['outdoor']) this.outdoorTemp.set(qp['outdoor']);
      if (qp['indoor']) this.indoorTemp.set(qp['indoor']);
    });

    setTimeout(() => {
      this.initDiagram();
    }, 50);
  }

  ngOnDestroy(): void {
    if (this.diagram) {
      this.diagram.div = null;
    }
  }

  private initDiagram(): void {
    if (!this.diagramDiv) return;

    const $ = go.GraphObject.make;

    this.diagram = $(go.Diagram, this.diagramDiv.nativeElement, {
      'undoManager.isEnabled': true,
      'grid.visible': true,
      'grid.gridCellSize': new go.Size(20, 20),
      'draggingTool.isGridSnapEnabled': true,
      'linkingTool.isEnabled': true,
      'relinkingTool.isEnabled': true,
      initialContentAlignment: go.Spot.Center,
      'animationManager.isEnabled': false
    });

    // Diagram background grid
    this.diagram.grid = $(go.Panel, 'Grid',
      { gridCellSize: new go.Size(20, 20) },
      $(go.Shape, 'LineH', { stroke: '#f1f5f9', strokeWidth: 1 }),
      $(go.Shape, 'LineV', { stroke: '#f1f5f9', strokeWidth: 1 })
    );

    // Node Selection Listener
    this.diagram.addDiagramListener('ChangedSelection', () => {
      if (!this.diagram) return;
      const selected = this.diagram.selection.first();
      if (selected instanceof go.Node && selected.data) {
        this.selectedElement.set({
          key: selected.data.key,
          text: selected.data.text || selected.data.name,
          code: selected.data.code || '',
          category: selected.data.category || '',
          coolingCapacity: selected.data.coolingCapacity || 0,
          heatingCapacity: selected.data.heatingCapacity || 0,
          imageUrl: selected.data.imageUrl || '',
          roomName: selected.data.roomName || 'Oda ' + selected.data.key
        });
      } else {
        this.selectedElement.set(null);
      }
    });

    // 1. OUTDOOR UNIT NODE TEMPLATE
    this.diagram.nodeTemplateMap.add('OUTDOOR',
      $(go.Node, 'Spot',
        {
          locationSpot: go.Spot.Center,
          shadowVisible: true,
          shadowColor: 'rgba(2, 132, 199, 0.15)',
          shadowOffset: new go.Point(0, 4),
          shadowBlur: 10
        },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Auto',
          $(go.Shape, 'RoundedRectangle', {
            fill: '#ffffff',
            stroke: '#0284c7',
            strokeWidth: 2,
            parameter1: 12
          }),
          $(go.Panel, 'Horizontal',
            { margin: 10 },
            $(go.Picture,
              {
                desiredSize: new go.Size(62, 62),
                imageStretch: go.ImageStretch.Uniform,
                margin: new go.Margin(0, 10, 0, 0),
                background: '#f8fafc'
              },
              new go.Binding('source', 'imageUrl')
            ),
            $(go.Panel, 'Vertical',
              { alignment: go.Spot.Left },
              $(go.Panel, 'Horizontal',
                { alignment: go.Spot.Left },
                $(go.Shape, 'Circle', { fill: '#0284c7', stroke: null, width: 8, height: 8, margin: new go.Margin(0, 6, 0, 0) }),
                $(go.TextBlock, { text: 'DIŞ ÜNİTE', font: '800 10px monospace', stroke: '#0284c7' })
              ),
              $(go.TextBlock,
                { font: 'bold 13px sans-serif', stroke: '#0f172a', margin: new go.Margin(3, 0, 1, 0) },
                new go.Binding('text', 'name')
              ),
              $(go.TextBlock,
                { font: '600 11px monospace', stroke: '#64748b' },
                new go.Binding('text', 'code')
              ),
              $(go.TextBlock,
                { font: 'bold 12px sans-serif', stroke: '#0284c7', margin: new go.Margin(3, 0, 0, 0) },
                new go.Binding('text', 'coolingCapacity', (c: number) => `Kapasite: ${c} kW`)
              )
            )
          )
        ),
        // Ports for Piping (Bottom) and Wiring (Right)
        this.makePort('OUT_PIPE', go.Spot.Bottom, true, true, '#0284c7'),
        this.makePort('OUT_WIRE', go.Spot.Right, true, true, '#7c3aed')
      )
    );

    // 2. INDOOR UNIT NODE TEMPLATE
    this.diagram.nodeTemplateMap.add('INDOOR',
      $(go.Node, 'Spot',
        {
          locationSpot: go.Spot.Center,
          shadowVisible: true,
          shadowColor: 'rgba(16, 185, 129, 0.15)',
          shadowOffset: new go.Point(0, 4),
          shadowBlur: 10
        },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Auto',
          $(go.Shape, 'RoundedRectangle', {
            fill: '#ffffff',
            stroke: '#10b981',
            strokeWidth: 2,
            parameter1: 12
          }),
          $(go.Panel, 'Horizontal',
            { margin: 10 },
            $(go.Picture,
              {
                desiredSize: new go.Size(58, 58),
                imageStretch: go.ImageStretch.Uniform,
                margin: new go.Margin(0, 10, 0, 0),
                background: '#f8fafc'
              },
              new go.Binding('source', 'imageUrl')
            ),
            $(go.Panel, 'Vertical',
              { alignment: go.Spot.Left },
              $(go.Panel, 'Horizontal',
                { alignment: go.Spot.Left },
                $(go.Shape, 'Circle', { fill: '#10b981', stroke: null, width: 8, height: 8, margin: new go.Margin(0, 6, 0, 0) }),
                $(go.TextBlock, { text: 'İÇ ÜNİTE', font: '800 10px monospace', stroke: '#10b981' })
              ),
              $(go.TextBlock,
                { font: 'bold 13px sans-serif', stroke: '#0f172a', margin: new go.Margin(3, 0, 1, 0) },
                new go.Binding('text', 'name')
              ),
              $(go.TextBlock,
                { font: '600 11px monospace', stroke: '#64748b' },
                new go.Binding('text', 'code')
              ),
              $(go.TextBlock,
                { font: 'bold 12px sans-serif', stroke: '#059669', margin: new go.Margin(3, 0, 0, 0) },
                new go.Binding('text', 'coolingCapacity', (c: number) => `${c} kW (Soğutma)`)
              )
            )
          )
        ),
        // Ports for Piping (Left/Top) and Wiring (Right/Bottom)
        this.makePort('IN_PIPE', go.Spot.Left, true, true, '#10b981'),
        this.makePort('IN_WIRE', go.Spot.Bottom, true, true, '#7c3aed')
      )
    );

    // 3. JOINT / REFNET NODE TEMPLATE
    this.diagram.nodeTemplateMap.add('JOINT',
      $(go.Node, 'Spot',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Auto',
          $(go.Shape, 'Diamond', {
            fill: '#fffbeb',
            stroke: '#d97706',
            strokeWidth: 2,
            width: 54,
            height: 54
          }),
          $(go.TextBlock,
            { font: 'bold 10px sans-serif', stroke: '#b45309', textAlign: 'center' },
            new go.Binding('text', 'code', (c: string) => 'Y-Joint\n' + (c.split('-')[2] || ''))
          )
        ),
        this.makePort('J_IN', go.Spot.Left, true, true, '#d97706'),
        this.makePort('J_OUT1', go.Spot.Top, true, true, '#d97706'),
        this.makePort('J_OUT2', go.Spot.Right, true, true, '#d97706')
      )
    );

    // 4. CONTROLLER NODE TEMPLATE
    this.diagram.nodeTemplateMap.add('CONTROLLER',
      $(go.Node, 'Spot',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Auto',
          $(go.Shape, 'RoundedRectangle', {
            fill: '#ffffff',
            stroke: '#7c3aed',
            strokeWidth: 1.5,
            parameter1: 10
          }),
          $(go.Panel, 'Horizontal',
            { margin: 8 },
            $(go.Picture,
              {
                desiredSize: new go.Size(46, 46),
                imageStretch: go.ImageStretch.Uniform,
                margin: new go.Margin(0, 8, 0, 0),
                background: '#f8fafc'
              },
              new go.Binding('source', 'imageUrl')
            ),
            $(go.Panel, 'Vertical',
              { alignment: go.Spot.Left },
              $(go.TextBlock, { text: 'KONTROLÖR', font: '800 9px monospace', stroke: '#7c3aed' }),
              $(go.TextBlock,
                { font: 'bold 12px sans-serif', stroke: '#0f172a', margin: new go.Margin(2, 0, 1, 0) },
                new go.Binding('text', 'name')
              ),
              $(go.TextBlock,
                { font: '600 10px monospace', stroke: '#6b7280' },
                new go.Binding('text', 'code')
              )
            )
          )
        ),
        this.makePort('CTL_WIRE', go.Spot.Top, true, true, '#7c3aed')
      )
    );

    // 5. LINK TEMPLATES (Piping vs Wiring)
    const pipingLinkTemplate = $(go.Link,
      {
        routing: go.Routing.AvoidsNodes,
        curve: go.Curve.JumpOver,
        corner: 12,
        toShortLength: 6,
        relinkableFrom: true,
        relinkableTo: true
      },
      // Outer refrigerant pipe casing (Refrigerant Blue)
      $(go.Shape, { isPanelMain: true, stroke: '#0284c7', strokeWidth: 4.5 }),
      // Inner fluid stream core (Pressurized light cyan core line)
      $(go.Shape, { isPanelMain: true, stroke: '#7dd3fc', strokeWidth: 2 }),
      // Modern Arrowhead
      $(go.Shape, {
        toArrow: 'Triangle',
        fill: '#0284c7',
        stroke: '#0369a1',
        strokeWidth: 1,
        scale: 1.3
      }),
      // Engineering specification label badge
      $(go.Panel, 'Auto',
        { segmentIndex: -1, segmentFraction: 0.5 },
        $(go.Shape, 'RoundedRectangle', {
          fill: '#f0f9ff',
          stroke: '#0284c7',
          strokeWidth: 1.2,
          parameter1: 12,
          shadowVisible: true,
          shadowColor: 'rgba(2, 132, 199, 0.15)',
          shadowOffset: new go.Point(0, 2),
          shadowBlur: 5
        }),
        $(go.Panel, 'Horizontal',
          { margin: new go.Margin(3, 8, 3, 8) },
          $(go.Shape, 'Circle', { fill: '#0284c7', stroke: null, width: 6, height: 6, margin: new go.Margin(0, 5, 0, 0) }),
          $(go.TextBlock,
            { font: 'bold 10.5px monospace', stroke: '#0369a1' },
            new go.Binding('text', 'label', (l: string) => l || 'Likit/Gaz: Ø15.88 / Ø9.52')
          )
        )
      )
    );

    const wiringLinkTemplate = $(go.Link,
      {
        routing: go.Routing.AvoidsNodes,
        curve: go.Curve.JumpOver,
        corner: 10,
        toShortLength: 5,
        relinkableFrom: true,
        relinkableTo: true
      },
      // Dashed communication bus line (Purple)
      $(go.Shape, {
        isPanelMain: true,
        stroke: '#7c3aed',
        strokeWidth: 2.5,
        strokeDashArray: [7, 4]
      }),
      // Sleek Arrowhead
      $(go.Shape, {
        toArrow: 'Standard',
        fill: '#7c3aed',
        stroke: null,
        scale: 1.2
      }),
      // Lavender bus badge
      $(go.Panel, 'Auto',
        { segmentIndex: -1, segmentFraction: 0.5 },
        $(go.Shape, 'RoundedRectangle', {
          fill: '#faf5ff',
          stroke: '#7c3aed',
          strokeWidth: 1.2,
          parameter1: 12,
          shadowVisible: true,
          shadowColor: 'rgba(124, 58, 237, 0.15)',
          shadowOffset: new go.Point(0, 2),
          shadowBlur: 5
        }),
        $(go.Panel, 'Horizontal',
          { margin: new go.Margin(3, 8, 3, 8) },
          $(go.Shape, 'Circle', { fill: '#7c3aed', stroke: null, width: 6, height: 6, margin: new go.Margin(0, 5, 0, 0) }),
          $(go.TextBlock,
            { font: 'bold 10.5px monospace', stroke: '#6d28d9' },
            new go.Binding('text', 'label', (l: string) => l || 'Sinyal Bus: 2x0.75')
          )
        )
      )
    );

    this.diagram.linkTemplateMap.add('PIPING', pipingLinkTemplate);
    this.diagram.linkTemplateMap.add('WIRING', wiringLinkTemplate);
    this.diagram.linkTemplate = pipingLinkTemplate;

    this.diagram.toolManager.linkingTool.archetypeLinkData = {
      category: 'PIPING',
      linkType: 'PIPING',
      label: 'Likit/Gaz: Ø15.88 / Ø9.52'
    };

    // Start with a completely blank/empty canvas (zero preloaded elements)
    const initialModel = new go.GraphLinksModel();
    initialModel.linkFromPortIdProperty = 'fromPort';
    initialModel.linkToPortIdProperty = 'toPort';
    initialModel.nodeDataArray = [];
    initialModel.linkDataArray = [];
    this.diagram.model = initialModel;
    this.canvasNodeCount.set(0);

    // Track model modifications to sync canvasNodeCount
    this.diagram.addModelChangedListener(() => {
      if (this.diagram) {
        this.canvasNodeCount.set(this.diagram.nodes.count);
      }
    });
  }

  private makePort(name: string, spot: go.Spot, output: boolean, input: boolean, color: string) {
    const $ = go.GraphObject.make;
    const isWiring = name.includes('WIRE');
    const portTitle = isWiring ? 'Sinyal / Kablo Portu' : 'Soğutucu Boru Portu';

    return $(go.Shape, 'Circle', {
      fill: '#ffffff',
      stroke: color,
      strokeWidth: 2.5,
      desiredSize: new go.Size(12, 12),
      alignment: spot,
      alignmentFocus: spot,
      portId: name,
      fromSpot: spot,
      toSpot: spot,
      fromLinkable: output,
      toLinkable: input,
      cursor: 'crosshair',
      toolTip: $(
        'ToolTip',
        $(go.TextBlock, { margin: 4, font: 'bold 10px sans-serif', stroke: '#1e293b' }, portTitle)
      ),
      mouseEnter: (e: go.InputEvent, port: go.GraphObject) => {
        if (port instanceof go.Shape) {
          port.fill = color;
          port.desiredSize = new go.Size(15, 15);
        }
      },
      mouseLeave: (e: go.InputEvent, port: go.GraphObject) => {
        if (port instanceof go.Shape) {
          port.fill = '#ffffff';
          port.desiredSize = new go.Size(12, 12);
        }
      }
    });
  }

  // Load a realistic, pre-configured sample topology for immediate usability
  private loadSampleTopology(): void {
    if (!this.diagram) return;

    const nodeDataArray = [
      { key: 1, category: 'OUTDOOR', name: 'VRF Modüler Dış Ünite', code: 'VRF-MOD-28kW', coolingCapacity: 28.0, heatingCapacity: 31.5, loc: '100 200' },
      { key: 2, category: 'JOINT', name: 'Refnet Branşman 1', code: 'REF-Y-22A', coolingCapacity: 0, heatingCapacity: 0, loc: '320 200' },
      { key: 3, category: 'INDOOR', name: '4 Yönlü Kaset (Salon)', code: 'CAS-4W-5.6kW', coolingCapacity: 5.6, heatingCapacity: 6.3, roomName: 'Toplantı Salonu', loc: '540 100' },
      { key: 4, category: 'INDOOR', name: 'Kanallı Tip (Açık Ofis)', code: 'DUCT-MED-7.1kW', coolingCapacity: 7.1, heatingCapacity: 8.0, roomName: 'Açık Ofis A', loc: '540 280' },
      { key: 5, category: 'CONTROLLER', name: 'Merkezi Dokunmatik Panel', code: 'BMS-CENTRAL-TOUCH', coolingCapacity: 0, heatingCapacity: 0, loc: '320 400' }
    ];

    const linkDataArray = [
      { from: 1, to: 2, fromPort: 'OUT_PIPE', toPort: 'J_IN', linkType: 'PIPING', label: 'Ana Hat Ø19.05 / Ø9.52' },
      { from: 2, to: 3, fromPort: 'J_OUT1', toPort: 'IN_PIPE', linkType: 'PIPING', label: 'Kol 1 Ø12.7 / Ø6.35' },
      { from: 2, to: 4, fromPort: 'J_OUT2', toPort: 'IN_PIPE', linkType: 'PIPING', label: 'Kol 2 Ø15.88 / Ø9.52' },
      { from: 5, to: 4, fromPort: 'CTL_WIRE', toPort: 'IN_WIRE', linkType: 'WIRING', label: 'Haberleşme Bus 2x0.75' }
    ];

    const model = new go.GraphLinksModel();
    model.linkFromPortIdProperty = 'fromPort';
    model.linkToPortIdProperty = 'toPort';
    model.nodeDataArray = nodeDataArray;
    model.linkDataArray = linkDataArray;
    this.diagram.model = model;
  }

  // Add Item From Palette to Center of View
  addItemToCanvas(item: PaletteItem): void {
    if (!this.diagram) return;

    let cx = 350;
    let cy = 250;
    try {
      const vb = this.diagram.viewportBounds;
      if (vb && isFinite(vb.centerX) && isFinite(vb.centerY) && vb.width > 50) {
        cx = vb.centerX;
        cy = vb.centerY;
      }
    } catch (e) {}

    const count = this.diagram.nodes.count;
    const offset = ((count % 6) - 3) * 45;
    const newKey = Date.now() + Math.floor(Math.random() * 1000);

    const nodeData = {
      key: newKey,
      category: item.nodeType,
      name: item.name,
      code: item.code,
      coolingCapacity: item.coolingCapacity,
      heatingCapacity: item.heatingCapacity,
      imageUrl: item.imageUrl,
      roomName: item.nodeType === 'INDOOR' ? `Oda ${count + 1}` : undefined,
      loc: `${Math.round(cx + offset)} ${Math.round(cy + offset)}`
    };

    this.diagram.startTransaction('add node');
    (this.diagram.model as go.GraphLinksModel).addNodeData(nodeData);
    this.diagram.commitTransaction('add node');

    const newNode = this.diagram.findNodeForKey(newKey);
    if (newNode) {
      this.diagram.select(newNode);
      this.diagram.scrollToRect(newNode.actualBounds);
    }

    this.canvasNodeCount.set(this.diagram.nodes.count);
    this.triggerToast(`${this.tsService.translate(item.name)} ${this.tsService.translate('çizime eklendi.')}`);
  }

  // Tool Modes
  setMode(mode: 'SELECT' | 'PIPING' | 'WIRING'): void {
    this.activeMode.set(mode);
    if (!this.diagram) return;

    if (mode === 'SELECT') {
      this.diagram.toolManager.linkingTool.isEnabled = true;
      this.diagram.toolManager.linkingTool.archetypeLinkData = {
        category: 'PIPING',
        linkType: 'PIPING',
        label: 'Likit/Gaz: Ø15.88 / Ø9.52'
      };
      this.triggerToast(this.tsService.translate('Seçim Modu Aktif'));
    } else if (mode === 'PIPING') {
      this.diagram.toolManager.linkingTool.isEnabled = true;
      this.diagram.toolManager.linkingTool.archetypeLinkData = {
        category: 'PIPING',
        linkType: 'PIPING',
        label: 'Likit/Gaz: Ø15.88 / Ø9.52'
      };
      this.triggerToast(this.tsService.translate('Borulama (Piping) Modu: Portlar arası sürükleyin'));
    } else if (mode === 'WIRING') {
      this.diagram.toolManager.linkingTool.isEnabled = true;
      this.diagram.toolManager.linkingTool.archetypeLinkData = {
        category: 'WIRING',
        linkType: 'WIRING',
        label: 'Sinyal Bus: 2x0.75'
      };
      this.triggerToast(this.tsService.translate('Kablolama (Wiring) Modu: Portlar arası sürükleyin'));
    }
  }

  // Canvas Actions
  zoomIn(): void {
    if (this.diagram) this.diagram.commandHandler.increaseZoom();
  }

  zoomOut(): void {
    if (this.diagram) this.diagram.commandHandler.decreaseZoom();
  }

  zoomFit(): void {
    if (this.diagram) this.diagram.commandHandler.zoomToFit();
  }

  undo(): void {
    if (this.diagram && this.diagram.commandHandler.canUndo()) {
      this.diagram.commandHandler.undo();
      this.canvasNodeCount.set(this.diagram.nodes.count);
    }
  }

  redo(): void {
    if (this.diagram && this.diagram.commandHandler.canRedo()) {
      this.diagram.commandHandler.redo();
      this.canvasNodeCount.set(this.diagram.nodes.count);
    }
  }

  deleteSelected(): void {
    if (this.diagram && this.diagram.commandHandler.canDeleteSelection()) {
      this.diagram.commandHandler.deleteSelection();
      this.canvasNodeCount.set(this.diagram.nodes.count);
      this.selectedElement.set(null);
    }
  }

  clearCanvas(): void {
    if (!this.diagram) return;
    if (confirm(this.tsService.translate('Çizim alanındaki tüm elemanlar silinecek. Emin misiniz?'))) {
      this.diagram.startTransaction('clear all');
      this.diagram.model = new go.GraphLinksModel({
        linkFromPortIdProperty: 'fromPort',
        linkToPortIdProperty: 'toPort',
        nodeDataArray: [],
        linkDataArray: []
      });
      this.diagram.commitTransaction('clear all');
      this.canvasNodeCount.set(0);
      this.selectedElement.set(null);
      this.triggerToast(this.tsService.translate('Çizim temizlendi.'));
    }
  }

  saveDrawing(): void {
    this.triggerToast(this.tsService.translate('Çizim başarıyla kaydedildi!'));
  }

  // Dynamic Metrics & Reports Calculation
  get reportData() {
    if (!this.diagram) {
      return {
        totalCooling: 0,
        totalHeating: 0,
        outdoorCapacity: 0,
        ratio: 0,
        indoorCount: 0,
        outdoorCount: 0,
        controllerCount: 0,
        jointCount: 0,
        pipeMeterEstimate: 0,
        bomItems: []
      };
    }

    const nodes = this.diagram.model.nodeDataArray as any[];
    const links = (this.diagram.model as go.GraphLinksModel).linkDataArray as any[];

    let totalCooling = 0;
    let totalHeating = 0;
    let outdoorCapacity = 0;
    let indoorCount = 0;
    let outdoorCount = 0;
    let controllerCount = 0;
    let jointCount = 0;

    const countMap: Record<string, { name: string; code: string; qty: number; capacity: number }> = {};

    nodes.forEach(n => {
      const key = n.code || n.name;
      if (!countMap[key]) {
        countMap[key] = {
          name: n.name,
          code: n.code,
          qty: 0,
          capacity: n.coolingCapacity || 0
        };
      }
      countMap[key].qty++;

      if (n.category === 'INDOOR') {
        totalCooling += Number(n.coolingCapacity || 0);
        totalHeating += Number(n.heatingCapacity || 0);
        indoorCount++;
      } else if (n.category === 'OUTDOOR') {
        outdoorCapacity += Number(n.coolingCapacity || 0);
        outdoorCount++;
      } else if (n.category === 'CONTROLLER') {
        controllerCount++;
      } else if (n.category === 'JOINT') {
        jointCount++;
      }
    });

    const ratio = outdoorCapacity > 0 ? Math.round((totalCooling / outdoorCapacity) * 100) : 0;
    const pipeLinks = links.filter(l => l.linkType === 'PIPING');
    const pipeMeterEstimate = pipeLinks.length * 8 + 12; // approximate calculation

    return {
      totalCooling: Math.round(totalCooling * 10) / 10,
      totalHeating: Math.round(totalHeating * 10) / 10,
      outdoorCapacity: Math.round(outdoorCapacity * 10) / 10,
      ratio,
      indoorCount,
      outdoorCount,
      controllerCount,
      jointCount,
      pipeMeterEstimate,
      bomItems: Object.values(countMap)
    };
  }

  openReports(): void {
    this.showReportsModal.set(true);
  }

  closeReports(): void {
    this.showReportsModal.set(false);
  }

  triggerToast(msg: string): void {
    this.notificationMessage.set(msg);
    setTimeout(() => {
      if (this.notificationMessage() === msg) {
        this.notificationMessage.set('');
      }
    }, 3000);
  }

  returnToHome(): void {
    this.router.navigate(['/frontend/home']);
  }
}
