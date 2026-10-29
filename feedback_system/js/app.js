// Main app: page layout, page views and button/click handling.
import { login, logout, registerStudent, watchAuth, submitFeedback, setStatus, listenFeedback } from "./firebase.js";
import { CATS, COURSES, YEARS, STATUSES, LOGO, icon, CAT_ICONS, $, v, esc, opts, note, fmt, fullname } from "./utils.js";

// ===== STATE =====
let ME = null;        // the logged-in user's profile
let PAGE = location.hash === "#register" ? "reg" : "login"; // landing page links to index.html#register   // current page: login, reg, sub, mine, prof, dash, rec, det, rep
let SEL = null;       // id of the feedback opened on the details page
let CACHE = [];       // feedback loaded from Firestore
let stopListening = null;
const F = { dash: { q: "", c: "", s: "", p: 1 }, rec: { q: "", c: "", s: "", p: 1 } }; // search, filters, page number

function db() { return { fb: CACHE }; }

// ===== LAYOUT: top bar + sidebar + content =====
function newStudentId() {
  return new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

function draw() {
  const a = $("app");
  if (!ME) { a.innerHTML = PAGE === "reg" ? regHTML() : loginHTML(); return; }
  const adm = ME.role === "admin";
  const nav = adm
    ? [["dash", "Dashboard", "dash"], ["rec", "Feedback Records", "list"], ["rep", "Reports", "chart"]]
    : [["sub", "Submit Feedback", "edit"], ["mine", "My Feedback", "list"], ["prof", "Profile", "user"]];
  if (!PAGE || (!nav.some((n) => n[0] === PAGE) && PAGE !== "det")) PAGE = nav[0][0];
  const cur = PAGE === "det" ? "rec" : PAGE;
  a.innerHTML =
    '<header class="top"><div class="brand">' + LOGO + '</div><div class="sp"></div><span class="bell" aria-hidden="true">' + icon("bell") + '</span><div class="who"><span class="avatar">' + esc((ME.first || "?").charAt(0).toUpperCase()) + '</span><span>' + esc(fullname(ME)) + "<small>" + (adm ? "Administrator" : "Student") + '</small></span></div></header>' +
    '<div class="shell"><nav class="side" aria-label="Main">' +
    nav.map((n) => '<button data-p="' + n[0] + '"' + (n[0] === cur ? ' aria-current="page"' : "") + ">" + icon(n[2]) + n[1] + "</button>").join("") +
    '<button class="out" data-a="out">' + icon("logout") + 'Logout</button></nav><main class="content pg" id="main"></main></div><div class="foot">El Royale Hotelier Training Center Inc., Tayabas City</div>';
  ({ sub: subHTML, mine: mineHTML, prof: profHTML, dash: dashHTML, rec: recHTML, rep: repHTML, det: detHTML })[PAGE]();
}

// Called whenever Firestore sends new data.
function refresh() {
  if (!ME) return;
  if (PAGE === "dash") { const s = $("stats"); if (s) s.innerHTML = statsInner(); tbl("dash"); }
  else if (PAGE === "rec") tbl("rec");
  else if (PAGE === "mine") mineHTML();
  else if (PAGE === "rep") repHTML();
}

// ===== VIEWS: login and registration =====
function loginHTML(){return'<div class="auth login"><div class="school">'+LOGO+'<h2>EL ROYALE HOTELIER TRAINING CENTER INC.</h2><div>TAYABAS CITY</div><p class="motto">“Quality Training for a Brighter Hospitality Career”</p></div>'+
'<div class="card auth-card"><h1>Web-Based Feedback System</h1><p class="sub">for El Royale Hotelier Training Center Inc., Tayabas City</p>'+
'<div class="fld"><label for="lu">Username</label><div class="inp">'+icon("user")+'<input id="lu" placeholder="Username" autocomplete="username"></div></div>'+
'<div class="fld"><label for="lp">Password</label><div class="inp">'+icon("lock")+'<input id="lp" type="password" placeholder="Password" autocomplete="current-password"><button class="eye" type="button" data-a="eye" aria-label="Show or hide password">'+icon("eye")+'</button></div></div>'+
'<button class="btn full" data-a="login">Login</button><div id="ln" class="note" hidden></div>'+
'<div class="links"><button class="lnk" data-p="reg">Register Here</button><span>|</span><button class="lnk" data-a="forgot">Forgot Password?</button></div>'+
'<div class="links"><a class="lnk" href="home.html">'+icon("info")+' System Information</a></div></div></div>'}
function regHTML(){
 var t=function(id,l,ph,ty){return'<div class="fld"><label for="'+id+'">'+l+'</label><input id="'+id+'" placeholder="'+ph+'"'+(ty?' type="'+ty+'"':'')+'></div>'};
 var s=function(id,l,a,f){return'<div class="fld"><label for="'+id+'">'+l+'</label><select id="'+id+'">'+opts(a,"",f)+'</select></div>'};
 return'<div class="auth reg"><div class="nav-top"><div class="brand">'+LOGO+'</div><div class="sp"></div><button class="navlink" data-p="login">'+icon("home")+'Home</button><button class="navlink out" data-p="login">Login</button></div>'+
 '<div class="regwrap"><div class="regside"><h1>Create Your Account</h1><p>Join our community and be part of a better learning experience.</p>'+
 '<div class="feat"><i>'+icon("user")+'</i><div><b>Submit Feedback</b>Share your thoughts and concerns.</div></div>'+
 '<div class="feat"><i>'+icon("chat")+'</i><div><b>Track Your Feedback</b>Check the status of your submissions.</div></div>'+
 '<div class="feat"><i>'+icon("home")+'</i><div><b>Help Improve Our School</b>Your feedback matters!</div></div></div>'+
 '<div class="card"><h2>Student Registration</h2><div class="grid">'+
 t("r_first","First Name *","e.g. Juan")+t("r_mid","Middle Name","e.g. Dela Cruz")+t("r_last","Last Name *","e.g. Santos")+t("r_uli","ULI No. *","e.g. 1234567890")+s("r_gen","Gender *",["Male","Female","Prefer not to say"],"Select Gender")+
 s("r_course","Course / Program *",COURSES,"Select Course")+s("r_year","Year Level *",YEARS,"Select Year Level")+t("r_contact","Contact Number *","e.g. 09171234567")+t("r_email","Email Address *","e.g. juan@email.com","email")+t("r_user","Username *","e.g. juandela")+t("r_addr","Address *","e.g. Brgy. San Isidro, Tayabas City")+t("r_pw","Password *","At least 6 characters","password")+t("r_pw2","Confirm Password *","Re-enter password","password")+
 '</div><button class="btn full" data-a="register">Register</button><div id="rn" class="note" hidden></div><div class="links">Already have an account? <button class="lnk" data-p="login">Login here</button></div></div></div></div>'}

// ===== VIEWS: student pages =====
function subHTML(){
 $("main").innerHTML='<div class="banner"><h1>Welcome, '+esc(fullname(ME))+'!</h1>Share your suggestions, comments, or concerns.</div><div class="two"><div class="card"><h2>Submit Feedback</h2>'+
 '<div class="fld"><label for="c">Category *</label><select id="c">'+opts(CATS,"","Select Category")+'</select></div><div class="fld"><label for="s">Subject *</label><input id="s" maxlength="90" placeholder="Enter subject"></div>'+
 '<div class="fld"><label for="m">Message *</label><textarea id="m" maxlength="1000" placeholder="Write your feedback here..."></textarea><small id="cnt" style="float:right">0/1000</small></div>'+
 '<div class="fld"><label>Submission Type *</label><div class="radios"><label><input type="radio" name="anon" value="1" checked> Anonymous</label><label><input type="radio" name="anon" value="0"> Show My Name</label></div></div>'+
 '<button class="btn full" data-a="submit">'+icon("send")+' Submit Feedback</button><div id="sn" class="note" hidden></div></div>'+
 '<div class="card cats"><h3>Feedback Categories</h3>'+CATS.map(function(c){return'<div><i>'+icon(CAT_ICONS[c])+'</i>'+c+'</div>'}).join('')+'</div></div>';
 $("m").oninput=function(){$("cnt").textContent=$("m").value.length+"/1000"}}
function steps(f){var s=STATUSES.indexOf(f.status);return'<ul class="tl"><li class="on"><b>Submitted</b><small>'+fmt(f.at)+'</small></li><li class="'+(s>=1?(s===3?'on':'cur'):'')+'"><b>Under Review</b><small>'+(s>=1?(s>=2?'Reviewed':'In progress'):'Pending')+'</small></li><li class="'+(s===3?'cur':'')+'"><b>Resolved</b><small>'+(s===3?'Done':'Pending')+'</small></li></ul>'}
function mineHTML(){
 var r=db().fb.filter(function(x){return x.uid===ME.id});
 $("main").innerHTML='<h1>My Feedback</h1>'+(r.length?'<div class="mine">'+r.map(function(x){return'<div class="card"><span class="pill '+x.status+'">'+x.status+'</span> <b>'+esc(x.subj)+'</b><div style="color:var(--mut);font-size:.85rem">'+esc(x.cat)+' · '+fmt(x.at)+' · '+(x.anon?'Anonymous':'Name shown')+'</div><p>'+esc(x.msg)+'</p>'+steps(x)+'</div>'}).join('')+'</div>':'<div class="card empty">You have not submitted feedback yet. Open Submit Feedback to send your first one.</div>')}
function profHTML(){
 var u=ME,rows=[["Student ID",u.sid],["Name",fullname(u)],["ULI No.",u.uli],["Gender",u.gender],["Course",u.course],["Year Level",u.year],["Contact",u.contact],["Email",u.email],["Username",u.username],["Address",u.address]];
 $("main").innerHTML='<h1>Profile</h1><div class="card"><dl>'+rows.map(function(r){return'<dt>'+r[0]+'</dt><dd>'+esc(r[1]||"-")+'</dd>'}).join('')+'</dl></div>'}

// ===== VIEWS: admin pages =====
function nm(x){return x.anon?"Anonymous":esc(x.name)}
function filt(m){var f=F[m];return db().fb.filter(function(x){return(!f.c||x.cat===f.c)&&(!f.s||x.status===f.s)&&(!f.q||(x.subj+" "+x.msg+" "+x.cat+" "+(x.anon?"":x.name)).toLowerCase().indexOf(f.q.toLowerCase())>-1)}).sort(function(a,b){return b.at<a.at?-1:1})}
function bar(m,st){return'<div class="bar"><div class="fld" style="flex:2"><label for="'+m+'q">Search feedback</label><input id="'+m+'q" type="search" placeholder="Search keyword..." value="'+esc(F[m].q)+'"></div><div class="fld"><label for="'+m+'c">Category</label><select id="'+m+'c">'+opts(CATS,F[m].c,"All Categories")+'</select></div>'+(st?'<div class="fld"><label for="'+m+'s">Status</label><select id="'+m+'s">'+opts(STATUSES,F[m].s,"All")+'</select></div>':'')+'</div>'}
function wire(m){["q","c","s"].forEach(function(k){var e=$(m+k);if(e)e.oninput=function(){F[m][k]=e.value;F[m].p=1;tbl(m)}})}
function tbl(m){
 var r=filt(m),per=5,pages=Math.max(1,Math.ceil(r.length/per)),f=F[m];if(f.p>pages)f.p=pages;
 var s=r.slice((f.p-1)*per,f.p*per);
 $(m+"t").innerHTML=s.length?'<table><thead><tr><th>Category</th><th>Feedback</th><th>Name</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody>'+s.map(function(x){return'<tr><td>'+esc(x.cat)+'</td><td>'+esc(x.subj)+'</td><td>'+nm(x)+'</td><td><span class="pill '+x.status+'">'+x.status+'</span></td><td>'+fmt(x.at)+'</td><td><button class="btn sm" data-a="view" data-id="'+x.id+'">View</button></td></tr>'}).join('')+'</tbody></table>':'<div class="empty">No feedback matches your search. Clear the keyword or change a filter.</div>';
 var h='';for(var i=1;i<=pages;i++)h+='<button data-a="pg" data-m="'+m+'" data-n="'+i+'"'+(i===f.p?' aria-current="true"':'')+'>'+i+'</button>';
 $(m+"p").innerHTML=pages>1?h:''}
function counts(){var a=db().fb,c=function(s){return a.filter(function(x){return x.status===s}).length};return{t:a.length,p:c("Pending"),r:c("Reviewed"),n:c("New"),d:c("Resolved")}}
function statsInner(){var c=counts();var k=function(cls,ic,l,n){return'<div class="stat '+cls+'"><span class="ico">'+icon(ic)+'</span><div>'+l+'<b>'+n+'</b></div></div>'};return k("b","chat","Total Feedback",c.t)+k("a","clock","Pending",c.p+c.n)+k("g","check","Reviewed",c.r+c.d)}
function dashHTML(){
 $("main").innerHTML='<h1>ADMIN DASHBOARD</h1><div class="stats" id="stats">'+statsInner()+'</div>'+bar("dash",false)+'<div class="tw"><div id="dasht"></div><div class="pager" id="dashp"></div></div>';wire("dash");tbl("dash")}
function recHTML(){$("main").innerHTML='<h1>FEEDBACK RECORDS</h1>'+bar("rec",true)+'<div class="tw"><div id="rect"></div><div class="pager" id="recp"></div></div>';wire("rec");tbl("rec")}
function detHTML(){
 var x=db().fb.filter(function(f){return f.id===SEL})[0];if(!x){go("rec");return}
 $("main").innerHTML='<h1>FEEDBACK RECORDS</h1><div class="two"><div class="card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px"><h2 style="margin:0">Feedback Details</h2><button class="btn out sm" data-p="rec">Back</button></div><dl>'+
 '<dt>Category</dt><dd>'+esc(x.cat)+'</dd><dt>Subject</dt><dd>'+esc(x.subj)+'</dd><dt>Message</dt><dd>'+esc(x.msg)+'</dd><dt>Submitted by</dt><dd>'+nm(x)+(x.anon?'':' (Student)')+'</dd><dt>Date</dt><dd>'+fmt(x.at)+'</dd><dt>Status</dt><dd><select id="st" style="width:auto">'+opts(STATUSES,x.status)+'</select> <button class="btn sm" data-a="setst" data-id="'+x.id+'">Update status</button><div id="dn" class="note" hidden></div></dd></dl></div><div class="card"><h3>Feedback Timeline</h3>'+steps(x)+'</div></div>'}
function repHTML(){var c=counts(),a=db().fb;
 $("main").innerHTML='<h1>REPORTS</h1><p style="color:var(--mut)">Generated '+new Date().toLocaleString()+'. Totals update as students submit and administrators change statuses.</p><div class="two"><div class="tw"><table style="min-width:0"><thead><tr><th>Category</th><th>Total</th><th>Unresolved</th></tr></thead><tbody>'+CATS.map(function(k){var l=a.filter(function(x){return x.cat===k});return'<tr><td>'+k+'</td><td>'+l.length+'</td><td>'+l.filter(function(x){return x.status!=="Resolved"}).length+'</td></tr>'}).join('')+'</tbody></table></div><div class="tw"><table style="min-width:0"><thead><tr><th>Status</th><th>Total</th></tr></thead><tbody><tr><td>New</td><td>'+c.n+'</td></tr><tr><td>Pending</td><td>'+c.p+'</td></tr><tr><td>Reviewed</td><td>'+c.r+'</td></tr><tr><td>Resolved</td><td>'+c.d+'</td></tr><tr><th>All feedback</th><th>'+c.t+'</th></tr></tbody></table></div></div>'}



// ===== EVENTS: all clicks go through one handler =====
document.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-p],[data-a]");
  if (!t) return;
  if (t.dataset.p) { PAGE = t.dataset.p; draw(); return; }
  const a = t.dataset.a;

  if (a === "login") {
    const id = v("lu"), pw = $("lp").value;
    if (!id || !pw) return note("ln", "Enter your username and password.", "err");
    try { await login(id, pw); }
    catch (er) {
      const wrong = ["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password", "auth/invalid-email"];
      note("ln", wrong.includes(er.code)
        ? "Incorrect username or password. Check your details and try again."
        : "Could not log in (" + (er.code || er.message) + "). Check js/firebase-config.js and that Email/Password sign-in is enabled in Firebase.", "err");
    }
  }
  else if (a === "eye") { const p = $("lp"); p.type = p.type === "password" ? "text" : "password"; }
  else if (a === "out") { await logout(); }
  else if (a === "forgot") note("ln", "To reset your password, contact the school administrator.");
  else if (a === "info") note("ln", "This system lets students send feedback to the school administration. Authorized administrators review and monitor it.");

  else if (a === "register") {
    const ids = ["r_first", "r_uli", "r_last", "r_gen", "r_course", "r_year", "r_contact", "r_email", "r_user", "r_addr", "r_pw", "r_pw2"];
    if (ids.some((i) => !v(i) || ((i === "r_pw" || i === "r_pw2") && !$(i).value))) return note("rn", "Fill in all required fields marked with *.", "err");
    if (!/^[A-Za-z0-9._-]{3,}$/.test(v("r_user"))) return note("rn", "Use a username of at least 3 letters, numbers, dots, dashes or underscores, with no spaces.", "err");
    if ($("r_pw").value.length < 6) return note("rn", "Use a password with at least 6 characters.", "err");
    if ($("r_pw").value !== $("r_pw2").value) return note("rn", "The passwords do not match. Re-enter them.", "err");
    try {
      await registerStudent(v("r_user"), $("r_pw").value, {
        sid: newStudentId(), first: v("r_first"), mid: v("r_mid"), last: v("r_last"), uli: v("r_uli"), gender: v("r_gen"),
        course: v("r_course"), year: v("r_year"), contact: v("r_contact"), email: v("r_email"), address: v("r_addr")
      });
      PAGE = "login"; draw(); note("ln", "Registered. Log in with your username and password.", "ok");
    } catch (er) {
      note("rn", er.code === "auth/email-already-in-use" ? "That username is already taken. Choose a different one or log in." : "Registration failed (" + (er.code || er.message) + "). Check your Firebase setup and try again.", "err");
    }
  }

  else if (a === "submit") {
    if (!v("c") || !v("s") || !v("m")) return note("sn", "Choose a category and enter a subject and message.", "err");
    const anon = document.querySelector('input[name="anon"]:checked').value === "1";
    try {
      await submitFeedback({ cat: v("c"), subj: v("s"), msg: v("m"), anon, uid: ME.id, name: fullname(ME), status: "New", at: new Date().toISOString() });
      subHTML(); note("sn", "Feedback submitted. The administration will review it. Track it under My Feedback.", "ok");
    } catch (er) { note("sn", "Could not submit feedback (" + (er.code || er.message) + "). Check your connection and try again.", "err"); }
  }

  else if (a === "view") { SEL = t.dataset.id; PAGE = "det"; draw(); }
  else if (a === "pg") { F[t.dataset.m].p = +t.dataset.n; tbl(t.dataset.m); }
  else if (a === "setst") {
    try { await setStatus(t.dataset.id, $("st").value); note("dn", "Status updated.", "ok"); }
    catch (er) { note("dn", "Could not update status (" + (er.code || er.message) + ").", "err"); }
  }
});

$("app").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.id === "lp") { const b = document.querySelector('[data-a="login"]'); if (b) b.click(); }
});

// ===== START: react to login / logout =====
watchAuth((user) => {
  if (stopListening) { stopListening(); stopListening = null; }
  ME = user;
  if (!user) { CACHE = []; if (PAGE !== "reg") PAGE = "login"; draw(); return; }
  PAGE = ""; draw();
  stopListening = listenFeedback(user, (list) => { CACHE = list; refresh(); }, (er) => console.error(er));
});
$("app").innerHTML = '<div class="auth"><p>Loading...</p></div>';
