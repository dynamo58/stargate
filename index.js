const $ = (a) => document.getElementById(a);

class Mode {
  constructor() {
    this.mode = "daily";
  }

  get() {
    return this.mode;
  }

  set(newMode) {
    if (!(newMode === "daily" || newMode == "practice")) {
      throw new Error(`Invalid mode: ${newMode}`);
    }

    this.mode = newMode;
  }
}

function getDay() {
  const date = new Date();
  return (
    date.getUTCFullYear() * 10000 +
    (date.getUTCMonth() + 1) * 100 +
    date.getUTCDate()
  );
}

class Game {
  constructor() {
    console.log("== BOOTING UP ==");

    this.mode = new Mode();
    this.ui = {
      modal: $("modal"),
      dailyBtn: $("daily"),
      practiceBtn: $("practice"),
      seriesSlt: $("series"),
      seasonSlt: $("season"),
      episodeSlt: $("episode"),
      snapshotImg: $("image"),
      modalCloseBtn: $("modal-close"),
      submitBtn: $("submit"),
      modalDiv: $("modal-content"),
      modalPracticeBtn: $("modal-practice"),
      dailyNumber: $("day"),
    };
    this.gameImg = null;

    this.ui.dailyNumber.innerText = getDay() - epoch + 1;

    this.ui.dailyBtn.onclick = () => {
      this.mode.set("daily");
      this.applyMode();
    };

    this.ui.practiceBtn.onclick = () => {
      this.mode.set("practice");
      this.applyMode();
    };

    this.reconciliateMode();
    this.applyMode();

    this.ui.seriesSlt.onchange = () => this.populate(false);
    this.ui.seasonSlt.onchange = () => this.populate(true);
    this.populate(false);

    this.ui.modalCloseBtn.onclick = () => this.ui.modal.close();

    this.ui.submitBtn.onclick = () => this.validate();

    this.ui.modalPracticeBtn.onclick = () => {
      console.log("== RESTARTING WITH PRACTICE MODE ==");

      this.ui.modal.close();
      this.mode.set("practice");
      this.applyMode();
      this.startRound();
    };

    this.startRound();
  }

  reconciliateMode() {
    const day = getDay();
    const record = localStorage.getItem(day);

    if (record === null) {
      this.mode.set("daily");
    } else {
      this.mode.set("practice");
    }
  }

  populate(skipSeries) {
    console.log("== UPDATING OPTIONS ==");

    const series = this.ui.seriesSlt.value;
    const seasons = Object.keys(stargate[series]);

    if (!skipSeries)
      this.ui.seasonSlt.innerHTML = seasons
        .map((s) => `<option key="${s}" value=${s}>${s}</option>`)
        .join("");

    const episodes = Object.entries(
      stargate[series][this.ui.seasonSlt.value],
    ).map(([e, { name }]) => `E${e} ${name}`);

    this.ui.episodeSlt.innerHTML = episodes
      .map((s) => `<option key="${s}" value=${s}>${s}</option>`)
      .join("");
  }

  applyMode() {
    if (this.mode.get() === "daily") {
      console.log("== SWITCHING TO DAILY ==");
      this.ui.dailyBtn.classList.add("is-active");
      this.ui.practiceBtn.classList.remove("is-active");
    } else {
      console.log("== SWITCHING TO PRACTICE ==");
      this.ui.practiceBtn.classList.add("is-active");
      this.ui.dailyBtn.classList.remove("is-active");
    }

    this.startRound();
  }

  startRound() {
    console.log("== STARTING ROUND ==");

    let idx;
    if (this.mode.get() === "daily") {
      idx = dailies[(getDay() - epoch) % dailies.length];
    } else {
      idx = Math.floor(Math.random() * images.length);
    }

    this.ui.snapshotImg.src = `/assets/images/stargate/snapshot-${idx}.png`;
    this.gameImg = images[idx];
  }

  validate() {
    console.log("== VALIDATING GUESS ==");

    if (this.mode.get() === "daily") {
      localStorage.setItem(getDay(), 42);
    }

    const series = this.ui.seriesSlt.value;
    const season = Number(this.ui.seasonSlt.value);
    // ugly hack, sue me!
    const episode = Number(
      this.ui.episodeSlt.value.split("E")[1].split(" ")[0],
    );

    const correct =
      series === this.gameImg[0] &&
      season === this.gameImg[1] &&
      episode === this.gameImg[2];

    if (correct) {
      this.ui.modalDiv.innerHTML = `<h1>CORRECT!</h1>`;
      new JSConfetti().addConfetti();
    } else {
      this.ui.modalDiv.innerHTML = `<h1>Wrong!</h1><p>Correct answer was: ${this.gameImg[0] === "SG1" ? "SG-1" : this.gameImg[0]}, season ${this.gameImg[1]}, E${this.gameImg[2]}.</p>`;
    }

    this.ui.modal.showModal();
  }
}
