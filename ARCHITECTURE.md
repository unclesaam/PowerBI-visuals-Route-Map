# Power BI Visual Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         visual.ts                                │
│                    (Main Controller)                             │
│  - Coordinates all managers                                      │
│  - Handles Power BI lifecycle (constructor, update)              │
│  - Implements enumerateObjectInstances                           │
└────┬──────────┬──────────┬──────────┬──────────┬───────────────┘
     │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────┐
│ DataParser│ │ColorMgr │ │  MapMgr  │ │LegendMgr│ │RouteRenderer │
│           │ │         │ │          │ │         │ │              │
│-getColumn │ │-getColor│ │-initMap  │ │-update  │ │-drawRoutes   │
│-parseData│ │-isHiContr│ │-getCurve │ │-setup   │ │-addTooltip   │
│-createIDs│ │-getColors│ │-fitBounds│ │-position│ │-addInteract  │
└─────┬───┘ └─────┬────┘ └────┬─────┘ └────┬────┘ └──────┬───────┘
      │           │           │            │             │
      │           │           │            │             │
      ▼           ▼           ▼            ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Support Modules                             │
│                                                                  │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐    │
│  │   types.ts   │  │validationUtils│  │selectionHandler  │    │
│  │              │  │               │  │                  │    │
│  │-RouteData    │  │-isValidLat    │  │-handleSelection  │    │
│  │              │  │-isValidLng    │  │-clearSelection   │    │
│  │              │  │-isValidRoute  │  │-showContextMenu  │    │
│  └──────────────┘  └───────────────┘  └──────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

Data Flow:
==========

1. Power BI calls visual.update()
2. DataParser extracts and validates data
3. ColorManager determines colors based on settings/legend
4. MapManager initializes/updates the Leaflet map
5. LegendManager updates (via updateDependencies) and renders the legend with proper positioning
6. RouteRenderer draws routes, bubbles, and tooltips
7. SelectionHandler manages user interactions
8. visual.ts coordinates all updates and re-renders

Manager Lifecycle:
==================
✓ MapManager - Created once in constructor, reused across updates
✓ SelectionHandler - Created once in constructor, reused across updates
✓ LegendManager - Created once in constructor, updated via updateDependencies()
✓ DataParser - Recreated on each update (stateless, lightweight)
✓ ColorManager - Recreated on each update (stateless, lightweight)
✓ RouteRenderer - Recreated on each update (stateless, lightweight)

Key Principles:
==============
✓ Single Responsibility: Each class has one clear purpose
✓ Dependency Injection: Managers receive dependencies via constructor
✓ Encapsulation: Internal logic hidden, public APIs exposed
✓ Reusability: Managers are independent and can be tested separately
✓ Maintainability: Changes isolated to specific files
```

