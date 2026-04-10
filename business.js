// business.js
let pickedStars = 0;
function pickStar(n) {
  pickedStars = n;
  const stars = document.querySelectorAll('#starPick span');
  stars.forEach((s,i) => s.textContent = i < n ? '★' : '☆');
  stars.forEach((s,i) => s.style.color = i < n ? '#ef9f27' : 'inherit');
}
function submitReview() {
  const txt = document.querySelector('.wr-textarea').value.trim();
  if (!pickedStars || !txt) { alert('Please select a rating and write a review.'); return; }
  alert('Review submitted! Thank you for your feedback.');
  document.querySelector('.wr-textarea').value = '';
  pickedStars = 0;
  pickStar(0);
}
function shareLink() {
  if (navigator.share) navigator.share({ title: 'Tata Main Hospital on CityFind', url: location.href });
  else { navigator.clipboard.writeText(location.href); alert('Link copied to clipboard!'); }
}