$(document).ready(function () {
    // ===================== Shared State =====================
    const selectedPairs = [];
    const selectedArticles = new Set();

    // ===================== Shared Helpers =====================
    function addImageCard(articleId, center, articleText, centerText, pairId) {
        const imageUrl = `/Home/GetImage?codArt=${encodeURIComponent(articleId)}&ID_CenterType=${encodeURIComponent(center)}`;
        const card = $(`
      <div class="col-md-5 col-lg-4 image-card" data-pair-id="${pairId}">
        <div class="card h-100">
          <img src="${imageUrl}" class="card-img-top" alt="${articleText} - ${centerText}">
          <div class="card-body text-center">
            <h6 class="card-title">${articleText}</h6>
            <p class="card-text mb-0">${centerText}</p>
          </div>
        </div>
      </div>
    `);
        $('#images-container .row').append(card);
        $('#imagePlaceholder').addClass('hidden');
        updateDownloadButtonVisibility();
    }

    function addMissingCard(id, centerText, pairId, type = 'articolo') {
    let label;
    switch (type) {
        case 'odp': label = `L'ID ODP <strong>${id}</strong>`; break;
        case 'cravatta': label = `La cravatta <strong>${id}</strong>`; break;
        default: label = `L'articolo <strong>${id}</strong>`;
    }

    const card = $(`
      <div class="col-md-5 col-lg-4 image-card" data-pair-id="${pairId}">
        <div class="card h-100 text-center p-3">
          <div class="card-body d-flex flex-column justify-content-center">
            <p class="mb-0">${label}<br>non ha una foto corrispondente</p>
          </div>
        </div>
      </div>
    `);
    $('#images-container .row').append(card);
    $('#imagePlaceholder').addClass('hidden');
    updateDownloadButtonVisibility();
}

    function createBubble(articleText, centerText, pairId, container) {
        const bubble = $(`
      <div class="selected-pair-bubble bg-primary text-white rounded-pill px-3 py-2 d-flex align-items-center" data-pair-id="${pairId}">
        <span>${articleText} - ${centerText}</span>
        <button type="button" class="btn-close btn-close-white ms-2"></button>
      </div>
    `);
        bubble.find('button').on('click', function () {
            $(`.selected-pair-bubble[data-pair-id="${pairId}"]`).remove();
            $(`.image-card[data-pair-id="${pairId}"]`).remove();
            const idx = selectedPairs.findIndex(p => p.id === pairId);
            if (idx !== -1) selectedPairs.splice(idx, 1);
            if (!$('.image-card').length) $('#imagePlaceholder').removeClass('hidden');
            updateDownloadButtonVisibility();
        });
        $(container).append(bubble);
    }

    function updateDownloadButtonVisibility() {
        const has = $('#images-container img, #images-container .card-body p').length > 0;
        $('#downloadAllButton, #clearAllWrapper')[has ? 'show' : 'hide']();
    }

    // ===================== Ricerca Generale =====================
    if ($('#options').length && $('#options1').length) {
        // init Select2
        $('#options').select2({
            placeholder: 'Articoli', allowClear: true,
            ajax: {
                url: 'https://localhost:7087/api/Articles/GetArticlesPage',
                dataType: 'json', delay: 250,
                data: p => ({ page: p.page || 1, pageSize: 1000, term: p.term }),
                processResults: (data, p) => ({
                    results: data.items.map(i => ({ id: i.iD_Article, text: i.iD_Article })),
                    pagination: { more: data.items.length === 1000 }
                }),
                cache: true
            },
            minimumInputLength: 0
        });
        $('#options1').select2({ placeholder: 'Reparti', allowClear: true, minimumResultsForSearch: Infinity });

        // bulk toggle
        $('#bulkInput').hide();
        $('#toggleBulkInput').on('change', function () {
            if (this.checked) {
                $('#options').next('.select2-container').hide();
                $('#bulkInput').show();
            } else {
                $('#bulkInput').hide();
                $('#options').next('.select2-container').show();
            }
        });

        // add
        $('#addPairButton').off('click').on('click', function () {
            const isBulk = $('#toggleBulkInput').is(':checked');
            const center = $('#options1').val();
            const centerText = $('#options1').select2('data')[0]?.text;
            if (!center) { alert('Seleziona un reparto.'); return; }

            let codes = [];
            if (isBulk) {
                codes = $('#bulkInput').val().split('\n').map(s => s.trim()).filter(Boolean);
                if (!codes.length) { alert("Inserisci almeno un codice."); return; }
            } else {
                const one = $('#options').val();
                if (!one) { alert("Seleziona un articolo."); return; }
                codes = [one];
            }

            codes.forEach(code => {
                const key = code + center;
                if (selectedArticles.has(key)) return;
                selectedArticles.add(key);
                const pid = `pair-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                selectedPairs.push({ id: pid, articleId: code, center, articleText: code, centerText });
                createBubble(code, centerText, pid, '#selected-pairs-container');
                addImageCard(code, center, code, centerText, pid);
            });

            if (isBulk) $('#bulkInput').val(''); else $('#options').val(null).trigger('change');
            $('#options1').val(null).trigger('change');
        });

        $('#imagePlaceholder').removeClass('hidden');
    }

    // ===================== Ricerca Specifica =====================
    if ($('#searchArticleInput').length && $('#searchArticleInput').attr('placeholder') === 'Inserisci ID articolo') {
        $('#searchCenterInput').select2({
            placeholder: 'Reparti', allowClear: true, minimumResultsForSearch: Infinity,
            dropdownParent: $('#searchArticlesForm')
        });

        // Bulk toggle for Specifica
        $('#bulkInput').hide();
        $('#toggleBulkInput').on('change', function () {
            if (this.checked) {
                $('#searchArticleInput').hide();
                $('#bulkInput').show();
            } else {
                $('#bulkInput').hide();
                $('#searchArticleInput').show();
            }
        });

        $('#searchButton').off('click').on('click', function () {
            const isBulk = $('#toggleBulkInput').is(':checked');
            const center = $('#searchCenterInput').val();
            const centerText = $('#searchCenterInput').select2('data')[0]?.text;
            if (!center) {
                alert("Seleziona un reparto.");
                return;
            }

            let ids = isBulk
                ? $('#bulkInput').val().split('\n').map(s => s.trim()).filter(Boolean)
                : [$('#searchArticleInput').val().trim()];

            if (!ids.length) {
                alert(isBulk
                    ? "Inserisci almeno un ID articolo per riga."
                    : "Inserisci un ID articolo.");
                return;
            }

            let total = ids.length;
            let successCount = 0;
            let failedIds = [];
            let completed = 0;

            ids.forEach(id => {
                const key = id + center;
                if (selectedArticles.has(key)) {
                    completed++;
                    return;
                }

                const imageUrl = `/Home/GetImage?codArt=${encodeURIComponent(id)}&ID_CenterType=${encodeURIComponent(center)}`;

                // Use fetch to check if image is valid
                fetch(imageUrl, { method: 'HEAD' })
                    .then(response => {
                        completed++;
                        if (response.ok) {
                            successCount++;
                            selectedArticles.add(key);
                            const pid = `spec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                            createBubble(id, centerText, pid, '#selected-pairs-container');
                            addImageCard(id, center, id, centerText, pid);
                        } else {
                            failedIds.push(id);
                        }
                        checkDone();
                    })
                    .catch(() => {
                        completed++;
                        failedIds.push(id);
                        checkDone();
                    });
            });

            function checkDone() {
                if (completed === total) {
                    if (successCount === 0) {
                        alert("Nessuno degli ID articolo inseriti ha una foto corrispondente.");
                    } else {
                        failedIds.forEach(id => {
                            const pid = `spec-miss-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                            addMissingCard(id, centerText, pid, "articolo");
                        });
                    }
                }
            }

            if (isBulk) $('#bulkInput').val('');
            else $('#searchArticleInput').val('');
            $('#searchCenterInput').val(null).trigger('change');
        });

        $('#imagePlaceholder').removeClass('hidden');
    }

    // ===================== Ricerca ODP =====================
    if ($('#searchArticleInput').length && $('#searchArticleInput').attr('placeholder') === 'Inserisci ID ODP') {
        $('#searchCenterInput').select2({
            placeholder: 'Reparti',
            allowClear: true,
            minimumResultsForSearch: Infinity,
            dropdownParent: $('#searchArticlesForm')
        });

        // Bulk‑toggle UI
        $('#bulkInputODP').hide();
        $('#toggleBulkInputODP').on('change', function () {
            if (this.checked) {
                $('#searchArticleInput').hide();
                $('#bulkInputODP').show();
            } else {
                $('#bulkInputODP').hide();
                $('#searchArticleInput').show();
            }
        });

        $('#searchButton').off('click').on('click', function () {
            const isBulk = $('#toggleBulkInputODP').is(':checked');
            const center = $('#searchCenterInput').val();
            const centerText = $('#searchCenterInput').select2('data')[0]?.text;

            if (!center) {
                alert('Seleziona un reparto.');
                return;
            }

            let odpIds = isBulk
                ? $('#bulkInputODP').val().split('\n').map(s => s.trim()).filter(Boolean)
                : [$('#searchArticleInput').val().trim()];

            if (!odpIds.length) {
                alert(isBulk
                    ? "Inserisci almeno un ID ODP per riga."
                    : "Inserisci un ID ODP."
                );
                return;
            }

            let total = odpIds.length;
            let successCount = 0;
            let failedIds = [];
            let completed = 0;

            odpIds.forEach(odpId => {
                $.ajax({
                    url: 'https://localhost:7087/api/ODP/GetODP',
                    type: 'GET',
                    dataType: 'text',
                    data: { odp_id: odpId },
                    success: function (articleId) {
                        completed++;
                        if (articleId) {
                            const key = articleId + center;
                            if (!selectedArticles.has(key)) {
                                selectedArticles.add(key);
                                const pid = `odp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                                createBubble(articleId, centerText, pid, '#selected-pairs-container');
                                addImageCard(articleId, center, articleId, centerText, pid);
                                successCount++;
                            }
                        } else {
                            failedIds.push(odpId);
                        }
                        checkCompletion();
                    },
                    error: function () {
                        completed++;
                        failedIds.push(odpId);
                        checkCompletion();
                    }
                });
            });

            function checkCompletion() {
                if (completed === total) {
                    if (successCount === 0) {
                        alert("Nessuno degli ODP inseriti ha una foto corrispondente.");
                    } else {
                        failedIds.forEach(odpId => {
                            const pid = `odp-miss-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                            addMissingCard(odpId, centerText, pid, "odp");
                        });
                    }
                }
            }

            if (isBulk) $('#bulkInputODP').val('');
            else $('#searchArticleInput').val('');
            $('#searchCenterInput').val(null).trigger('change');
        });

        $('#imagePlaceholder').removeClass('hidden');
    }

    // ===================== Ricerca Cravatta =====================
    if ($('#searchArticleInput').length &&
        $('#searchArticleInput').attr('placeholder') === 'Inserisci cravatta') {

        // turn "Reparto" into a Select2 dropdown
        $('#searchCenterInput').select2({
            placeholder: 'Reparti',
            allowClear: true,
            minimumResultsForSearch: Infinity,
            dropdownParent: $('#searchArticlesForm')
        });

        // hide bulk textarea by default
        $('#bulkInputCravatta').hide();

        // toggle bulk vs single
        $('#toggleBulkInputCravatta').on('change', function () {
            if (this.checked) {
                $('#searchArticleInput').hide();
                $('#bulkInputCravatta').show();
            } else {
                $('#bulkInputCravatta').hide();
                $('#searchArticleInput').show();
            }
        });

        $('#searchButton').off('click').on('click', function () {
    const isBulk = $('#toggleBulkInputCravatta').is(':checked');
    const center = $('#searchCenterInput').val();
    const centerText = $('#searchCenterInput').select2('data')[0]?.text;

    if (!center) {
        alert('Seleziona un reparto.');
        return;
    }

    let codes = isBulk
        ? $('#bulkInputCravatta').val().split('\n').map(s => s.trim()).filter(Boolean)
        : [ $('#searchArticleInput').val().trim() ];

    if (!codes.length) {
        alert(isBulk
            ? 'Inserisci almeno un codice cravatta per riga.'
            : 'Inserisci un codice cravatta.');
        return;
    }

    let total = codes.length;
    let successCount = 0;
    let failedCodes = [];

    let completed = 0;

    codes.forEach(code => {
        const key = code + center;
        if (selectedArticles.has(key)) {
            completed++;
            return;
        }

        $.ajax({
            url: 'https://localhost:7087/api/MaterialSecondary/GetArticleBySecondary',
            type: 'GET',
            dataType: 'text',
            data: { secondaryId: code },
            success: function(articleId) {
                completed++;
                if (articleId) {
                    successCount++;
                    selectedArticles.add(key);
                    const pid = `crav-${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
                    createBubble(articleId, centerText, pid, '#selected-pairs-container');
                    addImageCard(articleId, center, articleId, centerText, pid);
                } else {
                    failedCodes.push(code);
                }
                checkCompletion();
            },
            error: function() {
                completed++;
                failedCodes.push(code);
                checkCompletion();
            }
        });
    });

    function checkCompletion() {
        if (completed === total) {
            if (successCount === 0) {
                alert("Nessuna delle cravatte inserite ha una foto corrispondente.");
                return;
            }

            // Now show the missing ones, only if at least one match was found
            failedCodes.forEach(code => {
                const pid = `crav-miss-${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
                addMissingCard(code, centerText, pid, "cravatta");
            });
        }
    }

    // reset input
    if (isBulk) {
        $('#bulkInputCravatta').val('');
    } else {
        $('#searchArticleInput').val('');
    }
    $('#searchCenterInput').val(null).trigger('change');
});

        $('#imagePlaceholder').removeClass('hidden');
    }

    // ===================== Clear & Download =====================
    $('#clearAllPairs').on('click', () => {
        $('.selected-pair-bubble, .image-card').remove();
        selectedPairs.length = 0;
        selectedArticles.clear();
        $('#imagePlaceholder').removeClass('hidden');
        updateDownloadButtonVisibility();
    });

    $('#downloadAllButton').on('click', async () => {
        const imgs = $('#images-container img');
        if (!imgs.length) { alert('Nessuna immagine da scaricare.'); return; }
        const zip = new JSZip(), folder = zip.folder('immagini');
        const promises = imgs.map((i, el) =>
            fetch(el.src).then(r => r.blob()).then(b => folder.file(`immagine_${i + 1}.jpg`, b))
        ).get();
        await Promise.all(promises);
        zip.generateAsync({ type: 'blob' }).then(content => saveAs(content, 'immagini.zip'));
    });

    // ===================== Modal Preview =====================
    $(document).on('click', '.image-card img', function () {
        $('#modalImage').attr('src', this.src);
        $('#imageModal').modal('show');
    });
});
