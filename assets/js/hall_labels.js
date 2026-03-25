const FAME_LABELS = [null];
const SHAME_LABELS = [null];

// Format: "Title-Photographer-Description"
FAME_LABELS[1] = "muska and piza hit the casco bay bridge-realartmaine-The time Muska and piza hit the Casco bay bridge in 2022";
//SHAME
SHAME_LABELS[1] = "old uglyboy capped-realartmaine & chagrinedminnow-the toy was flicked by chagrinedminnow and ugbo aka uglyboy was flicked by me";
if (typeof window !== "undefined") {
  window.FAME_LABELS = FAME_LABELS;
  window.SHAME_LABELS = SHAME_LABELS;
}
