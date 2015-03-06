﻿define(
   ({
    common: {
      ok: 'OK',
      cancel: 'Avbryt',
      next: 'Neste',
      back: 'Bak'
    },
    errorCode: "Kode",
    errorMessage: "Melding",
    errorDetail: "Detaljer",
    widgetPlaceholderTooltip: "For å konfigurere går du til Widgeter og klikker på tilsvarende plassholder",
    symbolChooser: {
      preview: 'Forhåndsvisning',
      basic: 'Grunnleggende',
      arrows: 'Piler',
      business: 'Næringsliv',
      cartographic: 'Kartografisk',
      nationalParkService: 'National Park Service',
      outdoorRecreation: 'Utendørsaktiviteter',
      peoplePlaces: 'Folk og steder',
      safetyHealth: 'Helse og sikkerhet',
      shapes: 'Former',
      transportation: 'Transport',
      symbolSize: 'Symbolstørrelse',
      color: 'Farge',
      alpha: 'Alfa',
      outlineColor: 'Omrissfarge',
      outlineWidth: 'Omrissbredde',
      style: 'Stil',
      width: 'Bredde',
      text: 'Tekst',
      fontColor: 'Skriftfarge',
      fontSize: 'Skriftstørrelse',
      transparency: 'Gjennomsiktighet',
      solid: 'Heltrukket',
      dash: 'Strek',
      dot: 'Prikk',
      dashDot: 'Strek prikk',
      dashDotDot: 'Strek prikk prikk'
    },
    transparency: {
      opaque: 'Ugjennomsiktig',
      transparent: 'Gjennomsiktighet'
    },
    rendererChooser: {
      domain: 'Domene',
      use: 'Bruke',
      singleSymbol: 'Et enkeltsymbol',
      uniqueSymbol: 'Unike symboler',
      color: 'Farge',
      size: 'Størrelse',
      toShow: 'Å vise',
      colors: 'Farger',
      classes: 'Klasser:',
      symbolSize: 'Symbolstørrelse',
      addValue: 'Legg til verdi',
      setDefaultSymbol: 'Angi standardsymbol',
      defaultSymbol: 'Standardsymbol',
      selectedSymbol: 'Valgt symbol',
      value: 'Verdi',
      label: 'Etikett',
      range: 'Område'
    },
    drawBox: {
      point: "Punkt",
      line: "Linje",
      polyline: "Polylinje",
      freehandPolyline: "Frihåndspolylinje",
      triangle: "Trekant",
      extent: "Utstrekning",
      circle: "Sirkel",
      ellipse: "Ellipse",
      polygon: "Polygon",
      freehandPolygon: "Frihåndspolygon",
      text: "Tekst",
      clear: "Fjern"
    },
    popupConfig: {
      title: "Tittel",
      add: "Legg til",
      fields: "Felter",
      noField: "Ingen felt",
      visibility: "Synlig",
      name: "Navn",
      alias: "Alias",
      actions: "Handlinger"
    },
    includeButton: {
      include: "Inkluder"
    },
    loadingShelter: {
      loading: "Laster inn"
    },
    basicServiceBrowser: {
      noServicesFound: 'Ingen tjeneste funnet.',
      unableConnectTo: 'Kan ikke koble til'
    },
    serviceBrowser: {
      noGpFound: 'Fant ingen geoprosesseringstjeneste.',
      unableConnectTo: 'Kan ikke koble til'
    },
    layerServiceBrowser: {
      noServicesFound: 'Fant ingen karttjeneste eller geoobjektstjeneste',
      unableConnectTo: 'Kan ikke koble til'
    },
    basicServiceChooser: {
      validate: "Valider",
      example: "Eksempel",
      set: "Angi"
    },
    urlInput: {
      invalidUrl: 'Ugyldig URL.'
    },
    urlComboBox: {
      invalidUrl: 'Ugyldig URL.'
    },
    filterBuilder: {
      addAnotherExpression: "Legg til et filteruttrykk",
      addSet: "Legg til et uttrykkssett",
      matchMsg: "Hent geoobjekter i laget som samsvarer med ${any_or_all} av følgende uttrykk",
      matchMsgSet: "${any_or_all} av de følgende uttrykkene i dette settet er sanne",
      all: "Alle",
      any: "Noen",
      value: "Verdi",
      field: "Felt",
      unique: "Unike",
      none: "Ingen",
      and: "og",
      valueTooltip: "Angi verdi",
      fieldTooltip: "Velg fra eksisterende felt",
      uniqueValueTooltip: "Velg blant unike verdier i det valgte feltet",
      stringOperatorIs: "er", // e.g. <stringFieldName> is 'California'
      stringOperatorIsNot: "er ikke",
      stringOperatorStartsWith: "begynner på",
      stringOperatorEndsWith: "slutter på",
      stringOperatorContains: "inneholder",
      stringOperatorDoesNotContain: "inneholder ikke",
      stringOperatorIsBlank: "er tomt",
      stringOperatorIsNotBlank: "er ikke tomt",
      dateOperatorIsOn: "er den", // e.g. <dateFieldName> is on '1/1/2012'
      dateOperatorIsNotOn: "er ikke den",
      dateOperatorIsBefore: "er før",
      dateOperatorIsAfter: "er etter",
      dateOperatorDays: "dagene",
      dateOperatorWeeks: "ukene", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "månedene",
      dateOperatorInTheLast: "i de/den siste",
      dateOperatorNotInTheLast: "ikke i de/den siste",
      dateOperatorIsBetween: "er mellom",
      dateOperatorIsNotBetween: "er ikke mellom",
      dateOperatorIsBlank: "er tomt",
      dateOperatorIsNotBlank: "er ikke tomt",
      numberOperatorIs: "er", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "er ikke",
      numberOperatorIsAtLeast: "er minst",
      numberOperatorIsLessThan: "er mindre enn",
      numberOperatorIsAtMost: "er maksimalt",
      numberOperatorIsGreaterThan: "er større enn",
      numberOperatorIsBetween: "er mellom",
      numberOperatorIsNotBetween: "er ikke mellom",
      numberOperatorIsBlank: "er tomt",
      numberOperatorIsNotBlank: "er ikke tomt",
      string: "Streng",
      number: "Tall",
      date: "Dato",
      askForValues: "Spør om verdier",
      prompt: "Spør",
      hint: "Tips:",
      error: {
        invalidParams: "Ugyldige parametere.",
        invalidUrl: "Ugyldig URL.",
        noFilterFields: "Laget har ingen felter som kan brukes til filtrering.",
        invalidSQL: "Ugyldig SQL-uttrykk.",
        cantParseSQL: "Kan ikke analysere SQL-uttrykket."
      },
      caseSensitive: "Skille mellom store og små bokstaver"
    },

    featureLayerSource: {
      layer: "Lag",
      browse: "Bla gjennom",
      selectFromMap: "Velg fra kart",
      selectFromPortal: "Legg til fra portal",
      addServiceUrl: "Legg til tjeneste-URL",
      inputLayerUrl: "Angi kartlag-URL",
      selectLayer: "Velg et geoobjektslag i gjeldende kart.",
      chooseItem: "Velg et geoobjektslagelement.",
      setServiceUrl: "Angi URL-adressen for geoobjekts- eller karttjeneste.",
      selectFromOnline: "Legg til fra nettet",
      chooseLayer: "Velg et geoobjektslag."
    },
    gpSource: {
      selectFromPortal: "Legg til fra portal",
      addServiceUrl: "Legg til tjeneste-URL",
      selectFromOnline: "Legg til fra nettet",
      setServiceUrl: "Oppgi URL-en for geoprosesseringstjenesten.",
      chooseItem: "Velg et element for geoprosesseringstjenesten.",
      chooseTask: "Velg en geoprosesseringsoppgave."
    },
    itemSelector: {
      map: "Kart",
      selectWebMap: "Velg webkart",
      addMapFromOnlineOrPortal: "Finn og legg til et webkart som skal brukes i programmet fra ArcGIS Onlines offentlige ressurser eller ditt private innhold på ArcGIS Online eller Portal.",
      searchMapName: "Søk etter kartnavn ...",
      searchNone: "Vi finner ikke det du leter etter. Prøv på nytt.",
      groups: "Grupper",
      noneGroups: "Ingen grupper",
      signInTip: "Påloggingsøkten har utløpt. Oppdater webleseren for å logge på portalen din igjen.",
      signIn: "Logg inn",
      publicMap: "Felles",
      myOrganization: "Min organisasjon",
      myGroup: "Mine grupper",
      myContent: "Mitt innhold",
      count: "Antall",
      fromPortal: "fra Portal",
      fromOnline: "fra ArcGIS.com",
      noneThumbnail: "Miniatyrbilde ikke tilgjengelig",
      owner: "owner",
      signInTo: "Logg inn på",
      lastModified: "Sist endret",
      moreDetails: "Flere detaljer"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Denne tjenesten støtter ikke spørringer."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Det er ingen tilgjengelige lag i kartet."
    },
    layerInfosMenu: {
      titleBasemap: 'Bakgrunnskart',
      titleLayers: 'Operative kartlag',
      labelLayer: 'Lagnavn',
      itemZoomTo: 'Zoom til',
      itemTransparency: 'Gjennomsiktighet',
      itemTransparent: 'Gjennomsiktighet',
      itemOpaque: 'Ugjennomsiktig',
      itemMoveUp: 'Flytt opp',
      itemMoveDown: 'Flytt ned',
      itemDesc: 'Beskrivelse',
      itemDownload: 'Last ned',
      itemToAttributeTable: 'Åpne attributtabell'
    },
    imageChooser: {
      unsupportReaderAPI: "TODO: Leser støtter ikke filleser-API",
      readError: "Kan ikke lese filen.",
      invalidType: "Ugyldig filtype.",
      exceed: "Filstørrelsen må ikke overskride 1 024 kB",
      enableFlash: "TODO: aktiver flash.",
      toolTip: "Du får best resultater når bildet er ${width} piksler bredt og ${height} piksler høyt. Andre størrelser justeres slik at de passer. Godkjente bildeformater er PNG, GIF og JPEG."
    },
    simpleTable: {
      moveUp: 'Flytt opp',
      moveDown: 'Flytt ned',
      deleteRow: 'Slett',
      edit: 'Rediger'
    }
  })
);
