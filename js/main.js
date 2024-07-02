document.addEventListener("DOMContentLoaded", () => {
  let currentCategory = "all"; // 전역 변수로 currentCategory 초기화
  let currentImageIndex = 0;
  let lightboxImages = [];

  // 포트폴리오 데이터를 가져와서 페이지에 렌더링
  fetch("portfolioData.json")
    .then((response) => response.json())
    .then((data) => {
      const portfolioContainer = document.querySelector(".portfolio ul");
      data.forEach((item, index) => {
        const listItem = document.createElement("li");
        listItem.classList.add(item.type);

        const buttonsHTML = item.buttons
          .map((button, btnIndex) => {
            if (button.text === "VIEW SITE") {
              return `
            <button class="btn2">
              <a href="${button.link}" style="color: inherit; text-decoration: none; " target="_blank">
                ${button.text}
              </a>
            </button>
          `;
            } else {
              return `
            <button class="border-gradient border-gradient-purple lightbox-trigger" data-lightbox-img="${button.lightboxImg}" data-filter="${item.type}" data-index="${index}">
              ${button.text}
            </button>
          `;
            }
          })
          .join("");

        listItem.innerHTML = `
        <div class="codeWrap">
          <div class="imgWrap">
            <div class="portImg">
              ${
                item.video
                  ? `
                  <div class="video-container">
                  <video class="portfolio-video" muted loop playsinline poster="${item.imgSrc}" preload="auto">
                      <source src="${item.video}" type="video/mp4">
                      Your browser does not support the video tag.
                    </video>
                    <div class="loading-overlay">로딩 중...</div>
                  </div>
                  `
                  : `<img src="${item.imgSrc}" alt="">`
              }
            </div>
            <div class="imgDes">
              ${item.imgDes.map((desc) => `<span>${desc}</span>`).join("")}
            </div>
          </div>
          <div class="textWrap">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <p>${item.date}</p>
            ${item.tags.map((tag) => `<span>${tag}</span>`).join("")}
            <div class="buttons">
              ${buttonsHTML}
            </div>
          </div>
        </div>
      `;
        portfolioContainer.appendChild(listItem);

        // 비디오 이벤트 처리
        const videoContainer = listItem.querySelector(".video-container");
        if (videoContainer) {
          const video = videoContainer.querySelector("video");
          const loadingOverlay =
            videoContainer.querySelector(".loading-overlay");

          video.addEventListener("loadeddata", () => {
            loadingOverlay.style.display = "none";
          });

          video.addEventListener("error", () => {
            loadingOverlay.textContent = "비디오 로딩 실패";
          });

          const togglePlay = () => {
            if (video.paused) {
              video.play();
            } else {
              video.pause();
            }
          };

          // 데스크탑 호버 이벤트
          videoContainer.addEventListener("mouseenter", () => {
            video.play();
          });

          videoContainer.addEventListener("mouseleave", () => {
            video.pause();
            video.currentTime = 0;
          });

          // 모바일 터치 및 모든 기기 클릭 이벤트
          videoContainer.addEventListener("touchstart", (e) => {
            e.preventDefault();
            togglePlay();
          });

          videoContainer.addEventListener("click", () => {
            togglePlay();
          });
        }
      });

      filterItems("all", data);
      attachEventListeners(data);
    })
    .catch((error) => console.error("Error loading portfolio data:", error));

  //////////////////////// 필터링 함수 정의 ////////////////////////////
  function filterItems(category, data) {
    let galleryItems = document.querySelectorAll(".portfolio li");
    let filteredData = data.filter(
      (item) => category === "all" || item.type === category
    );

    galleryItems.forEach((item) => {
      if (category === "all" || item.classList.contains(category)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });

    // 버튼의 인덱스를 올바르게 설정
    filteredData.forEach((item, index) => {
      const buttons = document.querySelectorAll(
        `.lightbox-trigger[data-filter='${item.type}'][data-lightbox-img='${item.buttons[0].lightboxImg}']`
      );
      buttons.forEach((button) => {
        button.setAttribute("data-index", index);
        console.log(
          `Button data-index set: ${button.getAttribute(
            "data-index"
          )} for category: ${category}`
        );
      });
    });

    // 라이트박스 이미지를 lightboxImages 배열에 업데이트
    lightboxImages = filteredData.map(
      (item) => item.buttons.find((button) => button.lightboxImg).lightboxImg
    );
    currentCategory = category; // currentCategory 업데이트
    console.log(
      `Filter changed: currentCategory=${currentCategory}, lightboxImages=${lightboxImages}`
    );
  }

  //////////////////////// 이벤트 리스너 추가 ////////////////////////////
  function attachEventListeners(data) {
    let btns = document.querySelectorAll(".btn-work");

    function updateBtn(activeBtn) {
      btns.forEach((btn) => {
        btn.classList.remove("active");
      });
      activeBtn.classList.add("active");
    }

    btns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault(); // 기본 동작 방지
        const filter = this.getAttribute("data-filter");
        updateBtn(this);
        console.log(`Filter button clicked: ${filter}`);
        filterItems(filter, data);
      });
    });

    /////////////// 라이트박스 /////////////////////////////////////////////

    function openLightboxWithImages(images, index) {
      const lightbox = document.querySelector(".lightbox");
      const lightboxImg = lightbox.querySelector(".lightboxImage");
      lightboxImg.src = images[index]; // 이미지 배열과 인덱스를 이용하여 올바른 이미지를 설정합니다.
      lightbox.style.display = "block";
      currentImageIndex = index; // 현재 이미지 인덱스를 업데이트합니다.
      lightboxImages = images; // 현재 이미지 배열을 업데이트합니다.
      document.body.classList.add("lightbox-active");
      console.log(
        `Open lightbox: currentCategory=${currentCategory}, Index=${index}, Image=${images[index]}`
      );
    }

    function showPreviousImage() {
      currentImageIndex =
        (currentImageIndex - 1 + lightboxImages.length) % lightboxImages.length;
      openLightboxWithImages(lightboxImages, currentImageIndex);
      console.log(
        `Show previous image: currentCategory=${currentCategory}, Index=${currentImageIndex}, Image=${lightboxImages[currentImageIndex]}`
      );
    }

    function showNextImage() {
      currentImageIndex = (currentImageIndex + 1) % lightboxImages.length;
      openLightboxWithImages(lightboxImages, currentImageIndex);
      console.log(
        `Show next image: currentCategory=${currentCategory}, Index=${currentImageIndex}, Image=${lightboxImages[currentImageIndex]}`
      );
    }

    function closeLightbox() {
      const lightbox = document.querySelector(".lightbox");
      lightbox.style.display = "none";
      document.body.classList.remove("lightbox-active");
    }

    // 라이트박스 이전 버튼 이벤트 리스너 추가
    document
      .querySelector(".lightboxPrev")
      .addEventListener("click", function () {
        showPreviousImage();
      });

    // 라이트박스 다음 버튼 이벤트 리스너 추가
    document
      .querySelector(".lightboxNext")
      .addEventListener("click", function () {
        showNextImage();
      });

    // 라이트박스 닫기 버튼 이벤트 리스너 추가
    document
      .querySelector(".lightboxClose")
      .addEventListener("click", function () {
        closeLightbox();
      });

    // 트리거 버튼 클릭 이벤트 리스너 추가
    document.querySelectorAll(".lightbox-trigger").forEach((trigger) => {
      trigger.addEventListener("click", function (e) {
        const lightboxImg = e.target.getAttribute("data-lightbox-img");
        const index = parseInt(e.target.getAttribute("data-index"));
        console.log(`Clicked button lightbox-img: ${lightboxImg}`);
        console.log(`Computed index: ${index} for image: ${lightboxImg}`);
        if (index === -1) {
          console.error(
            `Index not found for lightbox-trigger element with data-lightbox-img: ${lightboxImg}`
          );
        }
        openLightboxWithImages(lightboxImages, index);
        console.log(
          `Trigger lightbox: currentCategory=${currentCategory}, Index=${index}, Image=${lightboxImg}`
        );
      });
    });
  }

  ///////////// Overlay and Cursor /////////////////////////////////

  // const overlay = document.querySelector(".overlay");
  // const cursor = document.querySelector(".cursor");

  // overlay.addEventListener("transitionend", function () {
  //   if (overlay.classList.contains("active")) {
  //     cursor.style.display = "block";
  //     document.body.style.cursor = "none";
  //   } else {
  //     cursor.style.display = "none";
  //     document.body.style.cursor = "default";
  //   }
  // });

  // document.addEventListener("mousemove", (e) => {
  //   cursor.style.left = e.pageX + "px";
  //   cursor.style.top = e.pageY + "px";
  // });

  /////////////// Star Effect /////////////////////////////////////

  function star() {
    let count = 100;
    let scene = document.querySelector(".scene");

    let i = 0;
    while (i < count) {
      let star = document.createElement("i");
      let x = Math.floor(Math.random() * window.innerWidth);
      let y = Math.floor(Math.random() * window.innerHeight);
      let duration = Math.random() * 10;
      let size = Math.random() * 2;

      star.style.left = x + "px";
      star.style.top = y + "px";
      star.style.width = 1 + size + "px";
      star.style.height = 1 + size + "px";
      star.style.animationDuration = 5 + duration + "s";
      star.style.animationDelay = duration + "s";
      scene.appendChild(star);
      i++;
    }
  }

  star();

  /////////////// Work Text Scroll /////////////////////////////////

  const scrollers = document.querySelectorAll(".scroller");
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    addAnimation();
  }
  function addAnimation() {
    scrollers.forEach((scroller) => {
      scroller.setAttribute("data-animated", true);

      const scrollerInner = scroller.querySelector(".scroller__inner");
      const scrollerContent = Array.from(scrollerInner.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        duplicatedItem.setAttribute("aria-hidden", true);
        scrollerInner.appendChild(duplicatedItem);
      });
    });
  }

  /////////////// Parallax Effect /////////////////////////////////

  const parallaxItems = document.querySelectorAll("[data-parallax-item]");

  let x, y;

  window.addEventListener("mousemove", function (event) {
    x = (event.clientX / window.innerWidth) * 10 - 5;
    y = (event.clientY / window.innerHeight) * 10 - 5;

    x = x - x * 2;
    y = y - y * 2;

    for (let i = 0, len = parallaxItems.length; i < len; i++) {
      x = x * Number(parallaxItems[i].dataset.parallaxSpeed);
      y = y * Number(parallaxItems[i].dataset.parallaxSpeed);
      parallaxItems[i].style.transform = `translate3d(${x}px, ${y}px, 0px)`;
    }
  });

  /////////////// Header & Back to Top Button /////////////////////

  const header = document.querySelector("[data-header]");
  const backTopBtn = document.querySelector(".backTopBtn");

  let lastScrollPos = 0;

  const hideHeader = function () {
    const isScrollBottom = lastScrollPos < window.scrollY;
    if (isScrollBottom) {
      header.classList.add("hide");
    } else {
      header.classList.remove("hide");
    }

    lastScrollPos = window.scrollY;
  };

  window.addEventListener("scroll", function () {
    if (window.scrollY >= 50) {
      backTopBtn.classList.add("active");
      hideHeader();
    } else {
      backTopBtn.classList.remove("active");
    }
  });

  backTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  ///////////////////////////////
  document.getElementById("pdf-link").addEventListener("click", openPdfPopup);

  function openPdfPopup() {
    const pdfUrl = "images/2024.pdf"; // PDF 파일 경로를 실제 경로로 설정하세요

    // 팝업 창을 화면 중앙에 나타나게 하기 위해 화면 크기와 팝업 크기를 계산합니다.
    const width = 1000;
    const height = 600;
    const top = screen.height / 2 - height / 2;

    const left = screen.width / 2 - width / 2;
    const popup = window.open(
      "",
      "_blank",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    popup.document.write(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <title>PDF Viewer</title>
              <style>
                  .pdf-page {
                      margin-bottom: 20px;
                  }
             
              </style>
              <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js"></script>
          </head>
          <body>
              <div id="pdf-container"></div>
              <script>
                  const url = '${pdfUrl}';
                  (function() {
                      const pdfjsLib = window['pdfjs-dist/build/pdf'];
                      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';

                      const loadingTask = pdfjsLib.getDocument(url);
                      loadingTask.promise.then(function(pdf) {
                          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                              pdf.getPage(pageNum).then(function(page) {
                                  const scale = 1.5;
                                  const viewport = page.getViewport({ scale: scale });

                                  const canvas = document.createElement('canvas');
                                  canvas.className = 'pdf-page';
                                  const context = canvas.getContext('2d');
                                  canvas.height = viewport.height;
                                  canvas.width = viewport.width;

                                  const renderContext = {
                                      canvasContext: context,
                                      viewport: viewport
                                  };
                                  page.render(renderContext);
                                  document.getElementById('pdf-container').appendChild(canvas);
                              });
                          }
                      });
                  })();
              </script>
          </body>
          </html>
      `);

    popup.document.close();
  }
}); //end
