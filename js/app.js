const serviceCards = [...document.querySelectorAll("[data-service-card]")];
    const serviceInputs = [...document.querySelectorAll('input[name="service"]')];

    const proCards = [...document.querySelectorAll("[data-pro-card]")];
    const proInputs = [...document.querySelectorAll('input[name="pro"]')];

    const dateEl = document.getElementById("date");
    const dateDisplay = document.getElementById("dateDisplay");
    const timeEl = document.getElementById("time");

    const nameEl = document.getElementById("fullName");
    const emailEl = document.getElementById("email");
    const phoneEl = document.getElementById("phone");

    const ccNumberEl = document.getElementById("ccNumber");
    const ccExpEl = document.getElementById("ccExp");
    const ccCvvEl = document.getElementById("ccCvv");
    const ccNameEl = document.getElementById("ccName");

    const proDisplay = document.getElementById("proDisplay");

    const summaryLine = document.getElementById("summaryLine");
    const summaryPrice = document.getElementById("summaryPrice");

    const confirmBtn = document.getElementById("confirmBtn");
    const disabledBtn = document.getElementById("disabledBtn");
    const ctaHint = document.getElementById("ctaHint");
    const clearBtn = document.getElementById("clearBtn");

    const confirmation = document.getElementById("confirmation");
    const confirmationText = document.getElementById("confirmationText");

    const pService = document.getElementById("pService");
    const pPro = document.getElementById("pPro");
    const pTime = document.getElementById("pTime");
    const pContact = document.getElementById("pContact");
    const pPay = document.getElementById("pPay");

    const mapHint = document.getElementById("mapHint");
    const mapBoxBrakes = document.getElementById("mapBoxBrakes");
    const mapBoxWheels = document.getElementById("mapBoxWheels");
    const mapBoxDrive  = document.getElementById("mapBoxDrive");
    const mapBoxFull   = document.getElementById("mapBoxFull");

    const svcError = document.getElementById("svcError");
    const proError = document.getElementById("proError");
    const dateError = document.getElementById("dateError");
    const timeError = document.getElementById("timeError");

    const calPrev = document.getElementById("calPrev");
    const calNext = document.getElementById("calNext");
    const calLabel = document.getElementById("calLabel");
    const calGrid = document.getElementById("calGrid");

    const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    const nameRegex = /^[A-Za-z][A-Za-z\s.'-]{1,}$/;
    const cardRegex = /^(?:\d[ -]*?){13,19}$/;
    const expRegex = /^(0[1-9]|1[0-2])\/(\d{2})$/;
    const cvvRegex = /^\d{3,4}$/;

    const today = (() => {
      const d = new Date();
      d.setHours(0,0,0,0);
      return d;
    })();

    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();
    let selectedDateISO = "";

    function clearMap(){
      [mapBoxBrakes, mapBoxWheels, mapBoxDrive, mapBoxFull].forEach(box => {
        if(!box) return;
        box.classList.remove("border-primary", "border-2");
      });
    }

    function setMap(kind){
      clearMap();
      if(kind === "brakes" && mapBoxBrakes) mapBoxBrakes.classList.add("border-primary","border-2");
      if(kind === "wheels" && mapBoxWheels) mapBoxWheels.classList.add("border-primary","border-2");
      if(kind === "drivetrain" && mapBoxDrive) mapBoxDrive.classList.add("border-primary","border-2");
      if(kind === "full" && mapBoxFull) mapBoxFull.classList.add("border-primary","border-2");
    }

    function isoFromDate(d){
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,"0");
      const day = String(d.getDate()).padStart(2,"0");
      return `${y}-${m}-${day}`;
    }

    function dateFromISO(iso){
      const [y,m,d] = iso.split("-").map(Number);
      const dt = new Date(y, m-1, d);
      dt.setHours(0,0,0,0);
      return dt;
    }

    function getSelectedService(){
      return serviceInputs.find(i => i.checked) || null;
    }

    function getSelectedPro(){
      return proInputs.find(i => i.checked) || null;
    }

    function getProOffDayIndex(){
      const p = getSelectedPro();
      if(!p) return null;
      const n = Number(p.dataset.off);
      return Number.isFinite(n) ? n : null;
    }

    function isWeekend(d){
      const dow = d.getDay();
      return dow === 0 || dow === 6;
    }

    function isDisabledDay(d){
      if(d < today) return true;
      if(isWeekend(d)) return true;

      const off = getProOffDayIndex();
      if(off === null) return true;

      return d.getDay() === off;
    }

    function renderCalendar(){
      const first = new Date(viewYear, viewMonth, 1);
      const startDay = first.getDay();
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      const label = first.toLocaleString(undefined, { month: "long", year: "numeric" });
      calLabel.textContent = label;

      calGrid.innerHTML = "";

      for(let i=0; i<startDay; i++){
        const blank = document.createElement("div");
        calGrid.appendChild(blank);
      }

      for(let day=1; day<=daysInMonth; day++){
        const d = new Date(viewYear, viewMonth, day);
        d.setHours(0,0,0,0);
        const iso = isoFromDate(d);

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cal-day";
        btn.textContent = String(day);
        btn.dataset.iso = iso;

        const disabled = isDisabledDay(d);
        btn.disabled = disabled;

        if(!disabled){
          btn.addEventListener("click", () => selectDateISO(iso));
        }

        if(selectedDateISO && iso === selectedDateISO){
          btn.classList.add("selected");
        }

        calGrid.appendChild(btn);
      }

      const proSelected = !!getSelectedPro();
      dateDisplay.placeholder = proSelected ? "Select a day from the calendar" : "Choose a professional first";
    }

    function selectDateISO(iso){
      const d = dateFromISO(iso);
      if(isDisabledDay(d)){
        selectedDateISO = "";
        dateEl.value = "";
        dateDisplay.value = "";
        return;
      }
      selectedDateISO = iso;
      dateEl.value = iso;
      dateDisplay.value = iso;
      dateError.innerHTML = '<i class="bi bi-exclamation-circle me-1"></i>Please choose an available date.';
      hide(dateError);
      updateAll();
      renderCalendar();
    }

    function luhnOk(num){
      let sum = 0;
      let alt = false;
      for(let i=num.length-1; i>=0; i--){
        const n = parseInt(num[i], 10);
        if(Number.isNaN(n)) return false;
        let t = n;
        if(alt){
          t *= 2;
          if(t > 9) t -= 9;
        }
        sum += t;
        alt = !alt;
      }
      return sum % 10 === 0;
    }

    function show(el){ el.classList.remove("d-none"); }
    function hide(el){ el.classList.add("d-none"); }

    function markInvalid(el, msg){
      el.classList.add("is-invalid");
      el.classList.remove("is-valid");
      const fb = el.parentElement.querySelector(".invalid-feedback") || el.closest(".col-12, .col-6, .col-md-4")?.querySelector(".invalid-feedback");
      if(fb && msg) fb.textContent = msg;
    }

    function markValid(el){
      el.classList.remove("is-invalid");
      el.classList.add("is-valid");
    }

    function validateName(){
      const v = nameEl.value.trim();
      if(!v || !nameRegex.test(v) || /\d/.test(v)){
        markInvalid(nameEl, "Please enter a valid name (letters only).");
        return false;
      }
      markValid(nameEl);
      return true;
    }

    function validateEmail(){
      if(!emailEl.value.trim() || !emailEl.checkValidity()){
        markInvalid(emailEl, "Please enter a valid email address.");
        return false;
      }
      markValid(emailEl);
      return true;
    }

    function validatePhone(){
      const v = phoneEl.value.trim();
      if(!v || !phoneRegex.test(v)){
        markInvalid(phoneEl, "Please enter a valid phone number (e.g., 613-000-0000).");
        return false;
      }
      markValid(phoneEl);
      return true;
    }

    function validateCard(){
      const raw = ccNumberEl.value.trim();
      const digits = raw.replace(/[^0-9]/g, "");
      if(!raw || !cardRegex.test(raw) || digits.length !== 16 || !luhnOk(digits)){
        markInvalid(ccNumberEl, "Please enter a valid 16-digit card number.");
        return false;
      }
      markValid(ccNumberEl);
      return true;
    }

    function validateExp(){
      const v = ccExpEl.value.trim();
      const m = v.match(expRegex);
      if(!m){
        markInvalid(ccExpEl, "Use MM/YY and make sure it's not expired.");
        return false;
      }
      const mm = Number(m[1]);
      const yy = Number(m[2]);
      const now = new Date();
      const curYY = now.getFullYear() % 100;
      const curMM = now.getMonth() + 1;
      if(yy < curYY || (yy === curYY && mm < curMM)){
        markInvalid(ccExpEl, "Card is expired.");
        return false;
      }
      markValid(ccExpEl);
      return true;
    }

    function validateCvv(){
      const v = ccCvvEl.value.trim();
      if(!cvvRegex.test(v)){
        markInvalid(ccCvvEl, "CVV must be 3–4 digits.");
        return false;
      }
      markValid(ccCvvEl);
      return true;
    }

    function validateCcName(){
      const v = ccNameEl.value.trim();
      if(!v || v.length < 2){
        markInvalid(ccNameEl, "Please enter the name on the card.");
        return false;
      }
      markValid(ccNameEl);
      return true;
    }

    function validateService(){
      const ok = !!getSelectedService();
      ok ? hide(svcError) : show(svcError);
      return ok;
    }

    function validatePro(){
      const ok = !!getSelectedPro();
      ok ? hide(proError) : show(proError);
      return ok;
    }

    function validateDate(){
      const v = dateEl.value;
      const ok = !!v;
      ok ? hide(dateError) : show(dateError);
      return ok;
    }

    function validateTime(){
      const ok = !!timeEl.value;
      ok ? hide(timeError) : show(timeError);
      return ok;
    }

    function updateProgress(){
      const hasService = !!getSelectedService();
      const hasPro = !!getSelectedPro();
      const hasTime = !!dateEl.value && !!timeEl.value;
      const hasContact = !!nameEl.value.trim() && !!emailEl.value.trim() && !!phoneEl.value.trim();
      const hasPay = !!ccNumberEl.value.trim() && !!ccExpEl.value.trim() && !!ccCvvEl.value.trim() && !!ccNameEl.value.trim();

      const setBar = (bar, ok) => {
        bar.classList.toggle("bg-secondary", !ok);
        bar.classList.toggle("bg-primary", ok);
      };

      setBar(pService, hasService);
      setBar(pPro, hasPro);
      setBar(pTime, hasTime);
      setBar(pContact, hasContact);
      setBar(pPay, hasPay);

      return { hasService, hasPro, hasTime, hasContact, hasPay };
    }

    function updateSummary(){
      const svc = getSelectedService();
      const pro = getSelectedPro();
      const date = dateEl.value;
      const time = timeEl.value;

      if(!svc){
        summaryLine.textContent = "Select a service to start.";
        summaryPrice.textContent = "—";
        mapHint.innerHTML = '<i class="bi bi-hand-index-thumb me-1"></i>Select a service card';
        clearMap();
        return;
      }

      summaryPrice.textContent = "$" + svc.dataset.price;

      const parts = [svc.value];
      if(pro) parts.push(pro.value);
      if(date && time) parts.push(date + " @ " + time);
      summaryLine.textContent = parts.join(" • ");

      mapHint.innerHTML = '<i class="bi bi-lightning-charge me-1"></i>Mapping updated';
      setMap(svc.dataset.map);
    }

    function isReady(){
      return validateService() &&
        validatePro() &&
        validateDate() &&
        validateTime() &&
        validateName() &&
        validateEmail() &&
        validatePhone() &&
        validateCard() &&
        validateExp() &&
        validateCvv() &&
        validateCcName();
    }

    function updateCTA(){
      const ready = isReadySoft();
      confirmBtn.classList.toggle("d-none", !ready);
      disabledBtn.classList.toggle("d-none", ready);
      ctaHint.textContent = ready ? "Looks good — confirm when you're ready." : "Complete Steps 1–5 to enable confirmation.";
    }

    function isReadySoft(){
      const svc = getSelectedService();
      const pro = getSelectedPro();
      return !!svc &&
        !!pro &&
        !!dateEl.value &&
        !!timeEl.value &&
        !!nameEl.value.trim() &&
        !!emailEl.value.trim() &&
        !!phoneEl.value.trim() &&
        !!ccNumberEl.value.trim() &&
        !!ccExpEl.value.trim() &&
        !!ccCvvEl.value.trim() &&
        !!ccNameEl.value.trim();
    }

    function updateProDisplay(){
      const pro = getSelectedPro();
      proDisplay.value = pro ? pro.value : "";
    }

    function updateAll(){
      updateProDisplay();
      updateSummary();
      updateProgress();
      updateCTA();
    }

    serviceCards.forEach(card => {
      card.addEventListener("click", () => {
        serviceCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");

        const id = card.getAttribute("for");
        if(id){
          serviceInputs.forEach(i => i.checked = false);
          const input = document.getElementById(id);
          if(input) input.checked = true;
        }

        hide(svcError);
        confirmation.classList.add("d-none");
        updateAll();
      });
    });

    proCards.forEach(card => {
      card.addEventListener("click", () => {
        proCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        hide(proError);

        const id = card.getAttribute("for");
        if(id){
          proInputs.forEach(i => i.checked = false);
          const input = document.getElementById(id);
          if(input) input.checked = true;
        }

        const currentISO = dateEl.value;
        if(currentISO){
          const d = dateFromISO(currentISO);
          if(isDisabledDay(d)){
            selectedDateISO = "";
            dateEl.value = "";
            dateDisplay.value = "";
            dateError.innerHTML = '<i class="bi bi-exclamation-circle me-1"></i>Your previous date isn\'t available for this professional — pick another.';
            show(dateError);
          }
        }

        confirmation.classList.add("d-none");
        renderCalendar();
        updateAll();
      });
    });

    calPrev.addEventListener("click", () => {
      viewMonth -= 1;
      if(viewMonth < 0){ viewMonth = 11; viewYear -= 1; }
      renderCalendar();
    });

    calNext.addEventListener("click", () => {
      viewMonth += 1;
      if(viewMonth > 11){ viewMonth = 0; viewYear += 1; }
      renderCalendar();
    });

    timeEl.addEventListener("input", () => { hide(timeError); confirmation.classList.add("d-none"); updateAll(); });

    
    function caretPosFromDigits(value, digitCount){
      if(digitCount <= 0) return 0;
      let count = 0;
      for(let i = 0; i < value.length; i++){
        const ch = value[i];
        if(ch >= "0" && ch <= "9"){
          count += 1;
          if(count === digitCount) return i + 1;
        }
      }
      return value.length;
    }

    function maskCardNumber(){
      const old = ccNumberEl.value;
      const cur = ccNumberEl.selectionStart || 0;
      const digitsBefore = old.slice(0, cur).replace(/\D/g, "").length;

      const digits = old.replace(/\D/g, "").slice(0, 16);
      const formatted = digits.replace(/(.{4})/g, "$1 ").trim();

      ccNumberEl.value = formatted;

      let newPos = caretPosFromDigits(formatted, digitsBefore);
      if(formatted[newPos] === " ") newPos += 1;
      ccNumberEl.setSelectionRange(newPos, newPos);
    }

    function maskExpiry(e){
      const old = ccExpEl.value;
      const cur = ccExpEl.selectionStart || 0;
      const digitsBefore = old.slice(0, cur).replace(/\D/g, "").length;

      const digits = old.replace(/\D/g, "").slice(0, 4);
      const isDelete = e && e.inputType && e.inputType.startsWith("delete");

      let formatted = "";
      if(digits.length < 2){
        formatted = digits;
      }else if(digits.length === 2){
        formatted = isDelete ? digits : digits + "/";
      }else{
        formatted = digits.slice(0, 2) + "/" + digits.slice(2);
      }

      ccExpEl.value = formatted;

      let newPos = caretPosFromDigits(formatted, digitsBefore);
      if(formatted[2] === "/" && newPos === 2) newPos = 3;
      ccExpEl.setSelectionRange(newPos, newPos);
    }

    ccNumberEl.addEventListener("input", maskCardNumber);
    ccExpEl.addEventListener("input", maskExpiry);

[nameEl, emailEl, phoneEl, ccNumberEl, ccExpEl, ccCvvEl, ccNameEl].forEach(el => {
      el.addEventListener("input", () => {
        confirmation.classList.add("d-none");
        updateAll();
      });
      el.addEventListener("blur", () => {
        if(el === nameEl) validateName();
        if(el === emailEl) validateEmail();
        if(el === phoneEl) validatePhone();
        if(el === ccNumberEl) validateCard();
        if(el === ccExpEl) validateExp();
        if(el === ccCvvEl) validateCvv();
        if(el === ccNameEl) validateCcName();
      });
    });

    document.getElementById("bookingForm").addEventListener("submit", (e) => {
      e.preventDefault();

      confirmation.classList.add("d-none");

      const ok = isReady();
      if(!ok){
        const firstInvalid = document.querySelector(".is-invalid");
        if(firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        else document.getElementById("service").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      const svc = getSelectedService();
      const pro = getSelectedPro();
      const digits = ccNumberEl.value.replace(/[^0-9]/g, "");
      const last4 = digits.slice(-4);

      const line = `${svc.value} • ${pro.value} • ${dateEl.value} @ ${timeEl.value} • ${nameEl.value.trim()} • Card **** ${last4}`;
      confirmationText.textContent = line;

      confirmation.classList.remove("d-none");
      confirmation.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    clearBtn.addEventListener("click", () => {
      serviceInputs.forEach(i => i.checked = false);
      serviceCards.forEach(c => c.classList.remove("selected"));

      proInputs.forEach(i => i.checked = false);
      proCards.forEach(c => c.classList.remove("selected"));

      selectedDateISO = "";
      dateEl.value = "";
      dateDisplay.value = "";
      timeEl.value = "";

      [nameEl, emailEl, phoneEl, ccNumberEl, ccExpEl, ccCvvEl, ccNameEl].forEach(el => {
        el.value = "";
        el.classList.remove("is-invalid","is-valid");
      });

      document.getElementById("bikeType").value = "";
      document.getElementById("notes").value = "";
      proDisplay.value = "";

      hide(svcError);
      hide(proError);
      dateError.innerHTML = '<i class="bi bi-exclamation-circle me-1"></i>Please choose an available date.';
      hide(dateError);
      hide(timeError);

      confirmation.classList.add("d-none");
      viewYear = today.getFullYear();
      viewMonth = today.getMonth();
      renderCalendar();
      updateAll();
      window.location.hash = "#service";
    });

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));

    renderCalendar();
    updateAll();
