$(document).ready(function () {
    // ===================== Common Variables =====================
    const selectedPairs = [];
    let selectedArticles = new Set();

    // ===================== Common Functions =====================
    function addImageCard(articleId, center, articleText, centerText, pairId) {
        const imageUrl = `/Home/GetImage?codArt=${encodeURIComponent(articleId)}&ID_CenterType=${encodeURIComponent(center)}`;
        const imageCard = $(`
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

        $('#images-container .row').append(imageCard);
        $('#imagePlaceholder').addClass('hidden');
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

            const index = selectedPairs.findIndex(p => p.id === pairId);
            if (index !== -1) selectedPairs.splice(index, 1);

            if ($('.image-card').length === 0) {
                $('#imagePlaceholder').removeClass('hidden');
            }
        });

        $(container).append(bubble);
    }

    // ===================== RicercaGenerale Page =====================
    if ($('#options').length && $('#options1').length) {
        // Initialize Select2 dropdowns
        $('#options').select2({
            placeholder: 'Articoli',
            allowClear: true,
            ajax: {
                url: 'https://localhost:7087/api/Articles/GetArticlesPage',
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    return {
                        page: params.page || 1,
                        pageSize: 1000,
                        term: params.term
                    };
                },
                processResults: function (data, params) {
                    params.page = params.page || 1;
                    return {
                        results: data.items.map(item => ({
                            id: item.iD_Article,
                            text: item.iD_Article
                        })),
                        pagination: {
                            more: data.items.length === 1000
                        }
                    };
                },
                cache: true
            },
            minimumInputLength: 0
        });

        $('#options1').select2({
            placeholder: 'Reparti',
            allowClear: true,
            minimumResultsForSearch: Infinity
        });

        // Handle "Add Pair" button
        $('#addPairButton').on('click', function () {
            const articleId = $('#options').val();
            const center = $('#options1').val();

            if (!articleId || !center) {
                alert("Seleziona sia un articolo che un reparto.");
                return;
            }

            const articleText = $('#options').select2('data')[0]?.text;
            const centerText = $('#options1').select2('data')[0]?.text;
            const pairId = `pair-${Date.now()}`;

            selectedPairs.push({ id: pairId, articleId, center, articleText, centerText });
            createBubble(articleText, centerText, pairId, '#selected-pairs-container');
            addImageCard(articleId, center, articleText, centerText, pairId);

            $('#options').val(null).trigger('change');
            $('#options1').val(null).trigger('change');
        });

        $('#materialImage').hide();
        $('#imagePlaceholder').removeClass('hidden');
    }

    // ===================== RicercaSpecifica Page =====================
    if ($('#searchCenterInput').length && $('#searchArticleInput').attr('placeholder') === 'Inserisci ID articolo') {
        // Initialize department dropdown
        $('#searchCenterInput').select2({
            placeholder: 'Reparti',
            allowClear: true,
            minimumResultsForSearch: Infinity,
            dropdownParent: $('#searchArticlesForm')
        });

        // Handle search button
        $('#searchButton').on('click', function () {
            const articleId = $('#searchArticleInput').val().trim();
            const center = $('#searchCenterInput').val();

            if (!articleId) {
                alert("Per favore inserisci un ID articolo valido.");
                return;
            }

            if (!center) {
                alert("Per favore seleziona un reparto valido.");
                return;
            }

            const articleText = articleId;
            const centerText = $('#searchCenterInput').select2('data')[0]?.text;
            const pairId = `spec-pair-${Date.now()}`;

            if (selectedArticles.has(articleId)) {
                alert('Questo articolo è già stato aggiunto.');
                return;
            }

            selectedArticles.add(articleId);
            createBubble(articleText, centerText, pairId, '#selected-pairs-container');
            addImageCard(articleId, center, articleText, centerText, pairId);

            $('#searchArticleInput').val('');
            $('#searchCenterInput').val(null).trigger('change');
        });

        $('#materialImage').hide();
        $('#imagePlaceholder').removeClass('hidden');
    }

    // ===================== RicercaODP Page =====================
    if ($('#searchCenterInput').length && $('#searchArticleInput').attr('placeholder') === 'Inserisci ID ODP') {
        // Initialize department dropdown
        $('#searchCenterInput').select2({
            placeholder: 'Reparti',
            allowClear: true,
            minimumResultsForSearch: Infinity,
            dropdownParent: $('#searchArticlesForm')
        });

        // Handle search button
        $('#searchButton').on('click', function () {
            const odpId = $('#searchArticleInput').val().trim();
            const center = $('#searchCenterInput').val();

            if (!odpId) {
                alert("Per favore inserisci un ID ODP valido.");
                return;
            }

            if (!center) {
                alert("Per favore seleziona un reparto valido.");
                return;
            }

            $.ajax({
                url: `https://localhost:7087/api/ODP/GetODP`,
                type: 'GET',
                dataType: 'text',
                data: { odp_id: odpId },
                success: function (articleId) {
                    if (!articleId) {
                        alert('Nessun articolo trovato per questo ODP.');
                        return;
                    }

                    const articleText = articleId;
                    const centerText = $('#searchCenterInput').select2('data')[0]?.text;
                    const pairId = `odp-pair-${Date.now()}`;

                    if (selectedArticles.has(articleId)) {
                        alert('Questo articolo è già stato aggiunto.');
                        return;
                    }

                    selectedArticles.add(articleId);
                    createBubble(articleText, centerText, pairId, '#selected-pairs-container');
                    addImageCard(articleId, center, articleText, centerText, pairId);

                    $('#searchArticleInput').val('');
                    $('#searchCenterInput').val(null).trigger('change');
                },
                error: function (xhr, status, error) {
                    console.error("AJAX Error:", status, error);
                    console.log("Response:", xhr.responseText);
                    alert("Errore durante la richiesta ODP.");
                }
            });
        });

        $('#materialImage').hide();
        $('#imagePlaceholder').removeClass('hidden');
    }

    // ===================== Modal Image Preview =====================
    $(document).on('click', '.image-card img', function () {
        const src = $(this).attr('src');
        $('#modalImage').attr('src', src);
        $('#imageModal').modal('show');
    });
});