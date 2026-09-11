export interface AdventureProfile {

  adventureType:
    | "drive"
    | "walk"
    | "kayak"
    | "bike";


  vehicle:
    | "suv"
    | "truck"
    | "van"
    | "ev"
    | string;


  tripStyle:
    | "weekend"
    | "road-trip"
    | "off-grid"
    | "basecamp"
    | string;


  crew:
    | "solo"
    | "couple"
    | "family"
    | "group"
    | string;


  people:number;


  duration:
    | "1-night"
    | "2-3-nights"
    | "4-7-nights"
    | "8-plus"
    | string;


  comfort?:
    | "minimal"
    | "balanced"
    | "comfort"
    | "premium"
    | string;


  budget?:number;

}
