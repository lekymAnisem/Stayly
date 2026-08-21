// Generated from frontend/src/data/properties.ts — do not edit by hand.
import type { Category, Destination, InspirationCardData, Property } from '../types.js'

export const img = (id: string, w = 900): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const categories: Category[] = [
  {
    "id": "beach",
    "label": "Beach",
    "icon": "Waves"
  },
  {
    "id": "views",
    "label": "Amazing views",
    "icon": "Mountain"
  },
  {
    "id": "cabins",
    "label": "Cabins",
    "icon": "Trees"
  },
  {
    "id": "pools",
    "label": "Pools",
    "icon": "Waves"
  },
  {
    "id": "tropical",
    "label": "Tropical",
    "icon": "Palmtree"
  },
  {
    "id": "countryside",
    "label": "Countryside",
    "icon": "Wheat"
  },
  {
    "id": "mountains",
    "label": "Mountains",
    "icon": "MountainSnow"
  },
  {
    "id": "luxury",
    "label": "Luxury",
    "icon": "Gem"
  },
  {
    "id": "tiny",
    "label": "Tiny homes",
    "icon": "HousePlus"
  },
  {
    "id": "islands",
    "label": "Islands",
    "icon": "Sailboat"
  },
  {
    "id": "trending",
    "label": "Trending",
    "icon": "Flame"
  },
  {
    "id": "lakefront",
    "label": "Lakefront",
    "icon": "LandPlot"
  }
]
export const properties: Property[] = [
  {
    "id": "boracay-beach-house",
    "title": "Beach house",
    "location": "Boracay",
    "country": "Philippines",
    "image": "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 5200,
    "rating": 4.92,
    "reviews": 214,
    "dates": "Aug 24 – 29",
    "propertyType": "Entire home",
    "guests": 6,
    "bedrooms": 3,
    "beds": 4,
    "amenities": [
      "Free parking",
      "Pool",
      "Air conditioning",
      "WiFi",
      "Beach access"
    ],
    "category": "beach",
    "guestFavorite": true
  },
  {
    "id": "el-nido-villa",
    "title": "Villa by the lagoon",
    "location": "El Nido, Palawan",
    "country": "Philippines",
    "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 9500,
    "rating": 4.98,
    "reviews": 132,
    "dates": "Sep 2 – 8",
    "propertyType": "Entire villa",
    "guests": 8,
    "bedrooms": 4,
    "beds": 5,
    "amenities": [
      "Pool",
      "Ocean view",
      "Kitchen",
      "WiFi",
      "Breakfast"
    ],
    "category": "islands",
    "guestFavorite": true
  },
  {
    "id": "siargao-surf-cabin",
    "title": "Surfer hideaway cabin",
    "location": "General Luna, Siargao",
    "country": "Philippines",
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 3200,
    "rating": 4.87,
    "reviews": 96,
    "dates": "Sep 10 – 15",
    "propertyType": "Entire cabin",
    "guests": 2,
    "bedrooms": 1,
    "beds": 2,
    "amenities": [
      "WiFi",
      "Surfboards",
      "Outdoor shower",
      "Kitchen"
    ],
    "category": "cabins"
  },
  {
    "id": "benguet-mountain-lodge",
    "title": "Mist-view mountain lodge",
    "location": "Baguio",
    "country": "Philippines",
    "image": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 4500,
    "rating": 4.84,
    "reviews": 178,
    "dates": "Oct 5 – 10",
    "propertyType": "Entire lodge",
    "guests": 5,
    "bedrooms": 2,
    "beds": 3,
    "amenities": [
      "Fireplace",
      "Mountain view",
      "Heating",
      "WiFi"
    ],
    "category": "mountains",
    "guestFavorite": true
  },
  {
    "id": "tagaytay-lakefront",
    "title": "Lakefront suite overlooking Taal",
    "location": "Tagaytay",
    "country": "Philippines",
    "image": "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 5800,
    "rating": 4.91,
    "reviews": 241,
    "dates": "Aug 28 – 31",
    "propertyType": "Entire suite",
    "guests": 4,
    "bedrooms": 2,
    "beds": 2,
    "amenities": [
      "Lake view",
      "Balcony",
      "Free parking",
      "WiFi",
      "Kitchen"
    ],
    "category": "lakefront",
    "guestFavorite": true
  },
  {
    "id": "bantayan-pool-villa",
    "title": "Palm-fringed pool villa",
    "location": "Bantayan, Cebu",
    "country": "Philippines",
    "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 7200,
    "rating": 4.89,
    "reviews": 87,
    "dates": "Sep 15 – 20",
    "propertyType": "Entire villa",
    "guests": 7,
    "bedrooms": 3,
    "beds": 4,
    "amenities": [
      "Private pool",
      "Garden",
      "BBQ",
      "WiFi",
      "Beach access"
    ],
    "category": "pools"
  },
  {
    "id": "manila-loft",
    "title": "Designer loft in the city",
    "location": "BGC, Manila",
    "country": "Philippines",
    "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 6800,
    "rating": 4.82,
    "reviews": 154,
    "dates": "Sep 1 – 4",
    "propertyType": "Entire loft",
    "guests": 3,
    "bedrooms": 1,
    "beds": 2,
    "amenities": [
      "City view",
      "Gym",
      "Elevator",
      "WiFi",
      "Workspace"
    ],
    "category": "trending"
  },
  {
    "id": "davao-tropical-studio",
    "title": "Tropical garden studio",
    "location": "Davao City",
    "country": "Philippines",
    "image": "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 2900,
    "rating": 4.76,
    "reviews": 64,
    "dates": "Oct 1 – 6",
    "propertyType": "Entire studio",
    "guests": 2,
    "bedrooms": 1,
    "beds": 1,
    "amenities": [
      "Garden",
      "Kitchen",
      "WiFi",
      "Free parking"
    ],
    "category": "tropical"
  },
  {
    "id": "baler-beachfront-cabin",
    "title": "Beachfront cabin with surf view",
    "location": "Baler, Aurora",
    "country": "Philippines",
    "image": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506045412240-22980140a405?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 3800,
    "rating": 4.85,
    "reviews": 73,
    "dates": "Sep 12 – 17",
    "propertyType": "Entire cabin",
    "guests": 4,
    "bedrooms": 2,
    "beds": 2,
    "amenities": [
      "Beach access",
      "WiFi",
      "Kitchen",
      "Terrace"
    ],
    "category": "beach"
  },
  {
    "id": "sagada-glass-house",
    "title": "Glass house in the clouds",
    "location": "Sagada",
    "country": "Philippines",
    "image": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 4100,
    "rating": 4.93,
    "reviews": 58,
    "dates": "Nov 8 – 12",
    "propertyType": "Entire home",
    "guests": 4,
    "bedrooms": 2,
    "beds": 3,
    "amenities": [
      "Panoramic view",
      "Fireplace",
      "Heating",
      "WiFi"
    ],
    "category": "views",
    "guestFavorite": true
  },
  {
    "id": "coron-waterfront-house",
    "title": "Waterfront island house",
    "location": "Coron, Palawan",
    "country": "Philippines",
    "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 8300,
    "rating": 4.9,
    "reviews": 119,
    "dates": "Sep 22 – 27",
    "propertyType": "Entire home",
    "guests": 6,
    "bedrooms": 3,
    "beds": 4,
    "amenities": [
      "Waterfront",
      "Kayaks",
      "Snorkeling gear",
      "Kitchen"
    ],
    "category": "islands"
  },
  {
    "id": "launion-tiny-beach-hut",
    "title": "Tiny beach hut off the grid",
    "location": "San Juan, La Union",
    "country": "Philippines",
    "image": "https://images.unsplash.com/photo-1521783988139-89397d761dce?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1521783988139-89397d761dce?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1495954484750-af469f2f9be5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 2400,
    "rating": 4.71,
    "reviews": 41,
    "dates": "Oct 18 – 20",
    "propertyType": "Tiny home",
    "guests": 2,
    "bedrooms": 1,
    "beds": 1,
    "amenities": [
      "Beach access",
      "Outdoor shower",
      "Bikes"
    ],
    "category": "tiny"
  },
  {
    "id": "bali-ricefield-villa",
    "title": "Ricefield villa in Ubud",
    "location": "Ubud",
    "country": "Indonesia",
    "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 12500,
    "rating": 4.97,
    "reviews": 302,
    "dates": "Nov 1 – 8",
    "propertyType": "Entire villa",
    "guests": 6,
    "bedrooms": 3,
    "beds": 3,
    "amenities": [
      "Private pool",
      "Breakfast",
      "Yoga deck",
      "WiFi"
    ],
    "category": "luxury",
    "guestFavorite": true
  },
  {
    "id": "greek-cave-house",
    "title": "Cave house with caldera view",
    "location": "Oia, Santorini",
    "country": "Greece",
    "image": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 22800,
    "rating": 4.99,
    "reviews": 214,
    "dates": "Dec 20 – 27",
    "propertyType": "Entire home",
    "guests": 4,
    "bedrooms": 2,
    "beds": 2,
    "amenities": [
      "Caldera view",
      "Infinity pool",
      "Breakfast",
      "Air conditioning"
    ],
    "category": "luxury",
    "guestFavorite": true
  },
  {
    "id": "japanese-ryokan",
    "title": "Traditional ryokan in the woods",
    "location": "Hakone",
    "country": "Japan",
    "image": "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 15400,
    "rating": 4.95,
    "reviews": 168,
    "dates": "Jan 10 – 14",
    "propertyType": "Entire ryokan",
    "guests": 4,
    "bedrooms": 2,
    "beds": 2,
    "amenities": [
      "Onsen",
      "Garden",
      "Kaiseki dinner",
      "Heating"
    ],
    "category": "countryside"
  },
  {
    "id": "swiss-chalet",
    "title": "Alpine chalet by the lake",
    "location": "Lauterbrunnen",
    "country": "Switzerland",
    "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1504681869696-d977211a5f4c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 19600,
    "rating": 4.96,
    "reviews": 87,
    "dates": "Dec 1 – 6",
    "propertyType": "Entire chalet",
    "guests": 8,
    "bedrooms": 4,
    "beds": 5,
    "amenities": [
      "Mountain view",
      "Fireplace",
      "Ski storage",
      "Heating"
    ],
    "category": "mountains",
    "guestFavorite": true
  },
  {
    "id": "maldives-water-villa",
    "title": "Overwater villa on stilts",
    "location": "Malé Atoll",
    "country": "Maldives",
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 32000,
    "rating": 5,
    "reviews": 45,
    "dates": "Feb 14 – 20",
    "propertyType": "Entire villa",
    "guests": 2,
    "bedrooms": 1,
    "beds": 1,
    "amenities": [
      "Overwater terrace",
      "Glass floor",
      "Private pool",
      "Breakfast"
    ],
    "category": "luxury"
  },
  {
    "id": "austin-modern-house",
    "title": "Modern desert house",
    "location": "Joshua Tree",
    "country": "United States",
    "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 9800,
    "rating": 4.88,
    "reviews": 233,
    "dates": "Nov 20 – 25",
    "propertyType": "Entire home",
    "guests": 6,
    "bedrooms": 3,
    "beds": 4,
    "amenities": [
      "Desert view",
      "Hot tub",
      "Fire pit",
      "WiFi"
    ],
    "category": "trending"
  },
  {
    "id": "iceland-glass-cabin",
    "title": "Northern lights glass cabin",
    "location": "Vik",
    "country": "Iceland",
    "image": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 11200,
    "rating": 4.94,
    "reviews": 76,
    "dates": "Jan 25 – 30",
    "propertyType": "Entire cabin",
    "guests": 3,
    "bedrooms": 1,
    "beds": 2,
    "amenities": [
      "Aurora viewing",
      "Hot tub",
      "Heating",
      "Kitchen"
    ],
    "category": "views"
  },
  {
    "id": "hanoi-old-town-apt",
    "title": "Old town heritage apartment",
    "location": "Hanoi",
    "country": "Vietnam",
    "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 3400,
    "rating": 4.79,
    "reviews": 122,
    "dates": "Oct 10 – 14",
    "propertyType": "Entire apartment",
    "guests": 4,
    "bedrooms": 2,
    "beds": 2,
    "amenities": [
      "City view",
      "WiFi",
      "Kitchen",
      "Laundry"
    ],
    "category": "trending"
  },
  {
    "id": "capetown-clifftop-villa",
    "title": "Clifftop villa overlooking the bay",
    "location": "Cape Town",
    "country": "South Africa",
    "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 15800,
    "rating": 4.9,
    "reviews": 98,
    "dates": "Dec 5 – 12",
    "propertyType": "Entire villa",
    "guests": 8,
    "bedrooms": 4,
    "beds": 5,
    "amenities": [
      "Ocean view",
      "Infinity pool",
      "Chef kitchen",
      "WiFi"
    ],
    "category": "luxury"
  },
  {
    "id": "newzealand-glenorchy-cabin",
    "title": "Lord of the Rings country cabin",
    "location": "Glenorchy",
    "country": "New Zealand",
    "image": "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80",
    "images": [
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80"
    ],
    "price": 7400,
    "rating": 4.86,
    "reviews": 61,
    "dates": "Mar 2 – 7",
    "propertyType": "Entire cabin",
    "guests": 4,
    "bedrooms": 2,
    "beds": 2,
    "amenities": [
      "Mountain view",
      "Fireplace",
      "Hiking access",
      "Kitchen"
    ],
    "category": "cabins"
  }
]
export const destinations: Destination[] = [
  {
    "id": "boracay",
    "name": "Boracay",
    "country": "Philippines",
    "description": "White-sand beaches and vibrant nightlife",
    "image": "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80",
    "stays": 640
  },
  {
    "id": "palawan",
    "name": "Palawan",
    "country": "Philippines",
    "description": "Lagoons, cliffs and island-hopping",
    "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
    "stays": 512
  },
  {
    "id": "cebu",
    "name": "Cebu",
    "country": "Philippines",
    "description": "Diving, whale sharks and seaside resorts",
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    "stays": 480
  },
  {
    "id": "siargao",
    "name": "Siargao",
    "country": "Philippines",
    "description": "World-class surf and laid-back vibes",
    "image": "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=900&q=80",
    "stays": 325
  },
  {
    "id": "baguio",
    "name": "Baguio",
    "country": "Philippines",
    "description": "Cool mountain air and pine forests",
    "image": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
    "stays": 289
  },
  {
    "id": "tagaytay",
    "name": "Tagaytay",
    "country": "Philippines",
    "description": "Lake views and cool weekend escapes",
    "image": "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=900&q=80",
    "stays": 231
  },
  {
    "id": "manila",
    "name": "Manila",
    "country": "Philippines",
    "description": "Skyline stays in the capital",
    "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
    "stays": 987
  },
  {
    "id": "davao",
    "name": "Davao",
    "country": "Philippines",
    "description": "Fruit markets and Mt. Apo adventures",
    "image": "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=900&q=80",
    "stays": 176
  }
]
export const inspirations: InspirationCardData[] = [
  {
    "id": "weekend",
    "title": "Weekend getaways",
    "description": "Quick escapes just around the corner",
    "image": "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "beach",
    "title": "Beach vacations",
    "description": "Sun, sand and salt air",
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "mountain",
    "title": "Mountain escapes",
    "description": "Breathe in the high-country air",
    "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "luxury",
    "title": "Luxury stays",
    "description": "Extraordinary homes, five-star comfort",
    "image": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "family",
    "title": "Family trips",
    "description": "Homes made for everyone",
    "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "remote",
    "title": "Remote work destinations",
    "description": "Fast WiFi with a view",
    "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"
  }
]
