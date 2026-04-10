// dashboard.js
const chartData = [
  {day:'Mon',val:142},{day:'Tue',val:186},{day:'Wed',val:203},{day:'Thu',val:165},
  {day:'Fri',val:248},{day:'Sat',val:312},{day:'Sun',val:192}
];
const max = Math.max(...chartData.map(d=>d.val));
document.getElementById('chart').innerHTML = chartData.map(d => `
  <div class="bar-col">
    <div class="bar-val">${d.val}</div>
    <div class="bar-fill" style="height:${Math.round((d.val/max)*100)}px;background:${d.day==='Sat'?'var(--navy)':'var(--blue)'}"></div>
    <div class="bar-lbl">${d.day}</div>
  </div>
`).join('');

function replyToReview(btn) {
  const parentDiv = btn.parentElement;
  if (parentDiv.querySelector('.reply-input')) return;
  const inputHtml = `<textarea class="reply-input" style="width:100%;border:1px solid var(--border);border-radius:8px;padding:8px;font-size:13px;font-family:var(--font-body);margin-bottom:6px;" placeholder="Write a reply..."></textarea><button style="background:var(--navy);color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:12px;cursor:pointer;" onclick="postReply(this)">Post reply</button>`;
  parentDiv.innerHTML = inputHtml;
}

function postReply(btn) {
  const txt = btn.previousElementSibling.value.trim();
  if (!txt) return;
  alert('Reply posted!');
  btn.parentElement.innerHTML = '<button class="reply-btn" onclick="replyToReview(this)">Reply to review</button>';
}