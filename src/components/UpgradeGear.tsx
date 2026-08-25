@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');


* {
  box-sizing: border-box;
}


html,
body {

  margin: 0;

  padding: 0;

  font-family: "Inter", Arial, sans-serif;

  background: #ffffff;

  color: #111111;

}


main {

  width:100%;

}


/* =========================
   START HERE HERO
========================= */


.startHero {

  position:relative;

  width:100%;

  height:100vh;

  overflow:hidden;

}



.startImage {

  object-fit:cover;

  z-index:1;

}



.startOverlay {

  position:absolute;

  inset:0;

  background:rgba(0,0,0,0.35);

  z-index:2;

}



/* HEADER */


.header {

  position:absolute;

  top:30px;

  left:7%;

  right:7%;

  display:flex;

  justify-content:space-between;

  align-items:center;

  z-index:10;

}



.logo {

  color:white;

  font-size:26px;

  font-weight:800;

  letter-spacing:5px;

}



nav {

  display:flex;

  gap:45px;

}



nav span {

  color:white;

  font-size:16px;

}



/* HERO TEXT */


.startContent {

  position:absolute;

  left:7%;

  top:50%;

  transform:translateY(-50%);

  z-index:10;

  color:white;

  max-width:650px;

}



.eyebrow {

  font-size:16px;

  letter-spacing:3px;

  font-weight:600;

}



.startContent h1 {

  font-size:72px;

  line-height:1.05;

  letter-spacing:-2px;

  margin:25px 0;

}



.desc {

  font-size:20px;

  line-height:1.5;

  max-width:520px;

}



button {

  margin-top:35px;

  padding:18px 35px;

  border:none;

  border-radius:40px;

  background:#164b35;

  color:white;

  font-size:16px;

  font-weight:600;

  cursor:pointer;

}



/* SCROLL HINT */


.scrollHint {

  position:absolute;

  bottom:40px;

  left:50%;

  transform:translateX(-50%);

  z-index:10;

  color:white;

  text-align:center;

  font-size:12px;

  letter-spacing:3px;

}



.arrow {

  margin-top:12px;

  font-size:24px;

  animation:scrollMove 1.8s infinite;

}



@keyframes scrollMove {


  0% {

    transform:translateY(0);

    opacity:.5;

  }


  50% {

    transform:translateY(8px);

    opacity:1;

  }


  100% {

    transform:translateY(0);

    opacity:.5;

  }

}



/* =========================
   JOURNEY SECTIONS
========================= */


.journeySection {

  display:flex;

  align-items:center;

  justify-content:space-between;

  gap:80px;

  padding:120px 7%;

  background:#ffffff;

}



.journeySection.reverse {

  flex-direction:row-reverse;

}



.journeyText {

  width:40%;

}



.number {

  font-size:18px;

  letter-spacing:4px;

  color:#777;

}



.journeyText h2 {

  font-size:52px;

  line-height:1.1;

  margin:20px 0;

  letter-spacing:-1px;

}



.subtitle {

  font-size:22px;

  color:#555;

  line-height:1.5;

}



.features {

  display:flex;

  gap:25px;

  margin-top:35px;

}



.features span {

  font-size:15px;

  color:#333;

}



/* IMAGE */


.journeyImage {

  position:relative;

  width:55%;

  height:520px;

}



.journeyImage img {

  object-fit:cover;

  border-radius:20px;

}



/* =========================
   COMPLETE SYSTEM
========================= */


.completeSection {

  padding:120px 7%;

  text-align:center;

}



.completeSection h2 {

  font-size:60px;

}



/* =========================
   MOBILE
========================= */


@media(max-width:900px){


  .startContent h1 {

    font-size:48px;

  }


  .header {

    left:5%;

    right:5%;

  }


  nav {

    gap:15px;

  }


  .journeySection,

  .journeySection.reverse {

    flex-direction:column;

  }


  .journeyText,

  .journeyImage {

    width:100%;

  }


  .journeyImage {

    height:400px;

  }


}
