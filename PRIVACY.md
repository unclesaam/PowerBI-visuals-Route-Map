
# Privacy Policy – Route Map Power BI Visual

**Effective date**: December 11, 2024

## Overview

The **Route Map** Power BI Custom Visual is developed and maintained by Samuel Cloutier. This Privacy Policy describes what data the visual processes and how it is handled.

## Data Collection

This visual:

- Does **NOT** collect or transmit any personal or user data
- Does **NOT** send telemetry, analytics, or tracking data
- Does **NOT** require any login or authentication
- Operates **entirely within** the user's Power BI environment

All data processed by the visual remains within Power BI and the user's browser or desktop application.

## Map Provider

This visual uses **OpenStreetMap** via public tile servers. When map tiles are loaded:
- Your IP address may be visible to OpenStreetMap tile servers (standard behavior for any web-based map)
- **No data from your Power BI report** is sent to OpenStreetMap
- Only tile requests (zoom level, lat/lng bounds) are transmitted

For more information on OpenStreetMap privacy: https://wiki.openstreetmap.org/wiki/Privacy_Policy

## Third-Party Services

**OpenStreetMap Tile Servers**
- Purpose: Display map tiles
- Data shared: IP address, tile coordinates (not your business data)
- Privacy Policy: https://operations.osmfoundation.org/policies/tiles/

## Data Processing

All data processing happens locally:
- Route coordinates are validated (lat/lng ranges)
- Colors are calculated based on conditional formatting rules
- Visual rendering occurs in your browser/Power BI Desktop
- No data leaves your Power BI environment

## Contact

For questions or privacy concerns:

📧 **Email**: samuel.cloutier.5@ulaval.ca  
🔗 **GitHub**: https://github.com/unclesaam/PowerBI-visuals-Route-Map

---

## AppSource Data Handling Summary

| Category                 | Description                                     |
|--------------------------|-------------------------------------------------|
| **Data collected**       | None                                            |
| **Data stored**          | None                                            |
| **Data shared**          | None (except IP to OpenStreetMap tile servers)  |
| **Third-party services** | OpenStreetMap (tiles only)                      |
| **User authentication**  | Not required                                    |
| **Cookies**              | None                                            |
| **Local storage**        | Power BI cached selections only                 |

---

© 2024 Samuel Cloutier. All rights reserved.
