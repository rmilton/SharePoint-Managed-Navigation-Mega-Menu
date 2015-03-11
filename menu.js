'use strict';

var terms;
var navTerms;
var TermStoreGroup = 'Pharma';
var TermStoreTermSet = 'Global Navigation';
var groupId = '430a6c01-7777-4f53-a359-6261be1c3156';
var termData = [];
var session;
var ctx;
var termStore;


function getTermData() {
    ctx = SP.ClientContext.get_current();
    session = SP.Taxonomy.TaxonomySession.getTaxonomySession(ctx);

    termStore = session.getDefaultSiteCollectionTermStore();

    var termSet = termStore.getTermSet('ffac2830-47c4-45d2-be1f-5dd4957fdfbb');
    terms = termSet.getAllTerms();

    ctx.load(terms, 'Include(IsRoot, CustomProperties, LocalCustomProperties, TermsCount, Id,Name, PathOfTerm, Parent, TermSet.Name)');
    ctx.executeQueryAsync(successGetTerms, failedGetTerms);
}

function successGetTerms() {
    var taxTermsEnumerator = terms.getEnumerator();
    while (taxTermsEnumerator.moveNext()) {
        var taxTerm = taxTermsEnumerator.get_current();

        var imageLocation = taxTerm.get_customProperties().images || '';
        var domId = taxTerm.get_customProperties().domId || '';
        var zone = taxTerm.get_customProperties().zone || '';
        var link = taxTerm.get_localCustomProperties()._Sys_Nav_SimpleLinkUrl || '';
        var parentName = taxTerm.get_name();

        if (!taxTerm.get_isRoot()) {
            parentName = taxTerm.get_parent().get_name();
        }

        termData.push({
            'Parent': parentName,
            'Text': taxTerm.get_name(),
            'Link': link,
            'ImgUrl': imageLocation,
            'DomId': domId,
            'Zone': zone
        });

        RenderMegaMenu(termData);
    }
}

function failedGetTerms(sender, args) {
    alert('failed: ' + args.get_message());
}

function RenderMegaMenu(data) {
    
    for (i = 0; i < data.length; i++) {
        var html = '';
        var link = data[i];
        var domId = link.DomId;
        var menu = $('#' + domId);

        if (menu.length > 0) {
            if (link.Zone !== '') {
                $('#' + link.Zone).append('<a href="' + link.Link + '">' + link.Text + '</a>');
            }
            else {
                html += '<a href="' + link.Link + '">' + link.Text + '</a>';
                $(menu).append(html);
            }
        }        
    }
}


$(function () {
    $('#DeltaTopNavigation li.dynamic-children').removeClass('dynamic-children');

    $('#DeltaTopNavigation ul.static > li a').mouseenter(function () {
        var navText = $(this).text();
        var menu = $('.megamenu[data-text="' + navText + '"');
        $(menu).slideDown('fast');
    });

    $('.ms-breadcrumb-box').mouseleave(function () {
        var navText = $(this).text();
        $('.megamenu').slideUp('fast');
    });

    $('.megamenu').mouseleave(function () {
        var navText = $(this).text();
        $('.megamenu').slideUp('fast');
    });
});

SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
    SP.SOD.registerSod('sp.taxonomy.js', SP.Utilities.Utility.getLayoutsPageUrl('sp.taxonomy.js'));
    SP.SOD.executeFunc('sp.taxonomy.js', 'SP.Taxonomy.TaxonomySession', function () {
        SP.SOD.registerSod('sp.publishing.js', SP.Utilities.Utility.getLayoutsPageUrl('sp.publishing.js'));
        SP.SOD.executeFunc('sp.publishing.js', 'SP.Publishing.Navigation.NavigationTermSet', function () {
            
            getTermData();
        });
    });
});