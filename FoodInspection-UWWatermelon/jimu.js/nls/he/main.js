﻿define(
   ({
    common: {
      ok: 'אישור',
      cancel: 'ביטול',
      next: 'הבא',
      back: 'חזור'
    },
    errorCode: "קוד",
    errorMessage: "הודעה",
    errorDetail: "פרט",
    widgetPlaceholderTooltip: "כדי להגדיר זאת, עבור לוידג\'טים ולחץ על ממלא המקום המתאים",
    symbolChooser: {
      preview: 'תצוגה מקדימה',
      basic: 'בסיסי',
      arrows: 'חיצים',
      business: 'עסקים',
      cartographic: 'קרטוגרפיה',
      nationalParkService: 'שירות הפארקים הלאומיים',
      outdoorRecreation: 'יצירה מבחוץ',
      peoplePlaces: 'מקומות של אנשים',
      safetyHealth: 'בטחון הציבור',
      shapes: 'צורות',
      transportation: 'תחבורה',
      symbolSize: 'גודל סמל',
      color: 'צבע',
      alpha: 'אלפא',
      outlineColor: 'צבע קו תוחם',
      outlineWidth: 'רוחב קו תוחם',
      style: 'סגנון',
      width: 'רוחב',
      text: 'טקסט',
      fontColor: 'צבע גופן',
      fontSize: 'גודל גופן',
      transparency: 'שקיפות',
      solid: 'מלא',
      dash: 'מקווקו',
      dot: 'נקודה',
      dashDot: 'קו נקודה',
      dashDotDot: 'קו נקודה נקודה'
    },
    transparency: {
      opaque: 'אטום',
      transparent: 'שקוף'
    },
    rendererChooser: {
      domain: 'דומיין',
      use: 'עם',
      singleSymbol: 'סמל יחיד',
      uniqueSymbol: 'סמלים ייחודיים',
      color: 'צבע',
      size: 'גודל',
      toShow: 'להציג',
      colors: 'צבעים',
      classes: 'קבוצות',
      symbolSize: 'גודל סמל',
      addValue: 'הוסף ערך',
      setDefaultSymbol: 'הגדר סמל ברירת מחדל',
      defaultSymbol: 'סימבול ברירת מחדל',
      selectedSymbol: 'בחר סמל',
      value: 'ערך',
      label: 'תווית',
      range: 'טווח'
    },
    drawBox: {
      point: "נקודה",
      line: "קו",
      polyline: "קו",
      freehandPolyline: "קו בשרטוט חופשי",
      triangle: "משולש",
      extent: "תיחום",
      circle: "מעגל",
      ellipse: "אליפסה",
      polygon: "פוליגון",
      freehandPolygon: "פוליגון בשרטוט חופשי",
      text: "טקסט",
      clear: "נקה"
    },
    popupConfig: {
      title: "כותרת",
      add: "הוסף",
      fields: "שדות",
      noField: "אין שדה",
      visibility: "ניראה",
      name: "שם",
      alias: "שם נוסף",
      actions: "פעולות"
    },
    includeButton: {
      include: "כלול"
    },
    loadingShelter: {
      loading: "טוען"
    },
    basicServiceBrowser: {
      noServicesFound: 'לא נמצא שירות:',
      unableConnectTo: 'לא יכול להתחבר'
    },
    serviceBrowser: {
      noGpFound: 'לא נמצא שרות geoprocessing.',
      unableConnectTo: 'לא יכול להתחבר'
    },
    layerServiceBrowser: {
      noServicesFound: 'לא נמצאו שירותי מפה או שירותי ישויות',
      unableConnectTo: 'לא יכול להתחבר'
    },
    basicServiceChooser: {
      validate: "אימות",
      example: "דוגמא",
      set: "הגדר"
    },
    urlInput: {
      invalidUrl: 'URL לא חוקי.'
    },
    urlComboBox: {
      invalidUrl: 'URL לא חוקי.'
    },
    filterBuilder: {
      addAnotherExpression: "הוסף ביטוי לסינון",
      addSet: "הוסף קבוצת ביטויים",
      matchMsg: "קבל ישויות בשכבה שתואמת ${any_or_all} מהביטויים הבאים",
      matchMsgSet: "${any_or_all} מהביטויים הבאים בסט זה הם נכונים",
      all: "הכל",
      any: "כלשהו",
      value: "ערך",
      field: "שדה",
      unique: "ייחודי",
      none: "ללא",
      and: "וגם",
      valueTooltip: "הכנס ערך",
      fieldTooltip: "בחר מתוך שדה קיים",
      uniqueValueTooltip: "בחר מתוך ערכים ייחודיים בשדה נבחר",
      stringOperatorIs: "הוא", // e.g. <stringFieldName> is 'California'
      stringOperatorIsNot: "אינו",
      stringOperatorStartsWith: "מתחיל עם",
      stringOperatorEndsWith: "מסתיים ב",
      stringOperatorContains: "מכיל",
      stringOperatorDoesNotContain: "לא מכיל",
      stringOperatorIsBlank: "ריק",
      stringOperatorIsNotBlank: "אינו ריק",
      dateOperatorIsOn: "הוא ב-", // e.g. <dateFieldName> is on '1/1/2012'
      dateOperatorIsNotOn: "אינו ב-",
      dateOperatorIsBefore: "הוא לפני",
      dateOperatorIsAfter: "הוא אחרי",
      dateOperatorDays: "ימים",
      dateOperatorWeeks: "שבועות", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "חודשים",
      dateOperatorInTheLast: "בסוף",
      dateOperatorNotInTheLast: "לא בסוף",
      dateOperatorIsBetween: "בין",
      dateOperatorIsNotBetween: "לא נמצא בין",
      dateOperatorIsBlank: "ריק",
      dateOperatorIsNotBlank: "אינו ריק",
      numberOperatorIs: "הוא", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "אינו",
      numberOperatorIsAtLeast: "הוא לפחות",
      numberOperatorIsLessThan: "הוא פחות מ-",
      numberOperatorIsAtMost: "הוא לכל היותר",
      numberOperatorIsGreaterThan: "הוא גדול מ-",
      numberOperatorIsBetween: "בין",
      numberOperatorIsNotBetween: "לא נמצא בין",
      numberOperatorIsBlank: "ריק",
      numberOperatorIsNotBlank: "אינו ריק",
      string: "מחרוזת",
      number: "מספר",
      date: "תאריך",
      askForValues: "בקש ערכים",
      prompt: "בקשה להזנה",
      hint: "רמז",
      error: {
        invalidParams: "פרמטרים לא חוקיים.",
        invalidUrl: "URL לא חוקי.",
        noFilterFields: "לשכבוה אין שדות בהם ניתן להשתמש לסינון.",
        invalidSQL: "ביטוי SQL לא חוקי.",
        cantParseSQL: "לא ניתן לפענח את ביטוי ה-SQL."
      },
      caseSensitive: "תלוי רישיות"
    },

    featureLayerSource: {
      layer: "שכבה",
      browse: "דפדף",
      selectFromMap: "בחר ממפה",
      selectFromPortal: "הוסף מפורטל",
      addServiceUrl: "הוסף כתובת URL של שירות",
      inputLayerUrl: "URL של שכבת הקלט",
      selectLayer: "בחר שכבת ישויות מהמפה הנוכחית.",
      chooseItem: "בחר פריט שכבת ישויות.",
      setServiceUrl: "הזן את כתובת ה-URL של שירות הישויות או שירות המפות.",
      selectFromOnline: "הוסף  מתוך ה-Online",
      chooseLayer: "בחר שכבת ישויות."
    },
    gpSource: {
      selectFromPortal: "הוסף מהפורטל",
      addServiceUrl: "הוסף כתובת URL של שירות",
      selectFromOnline: "הוסף מתוך ה-Online",
      setServiceUrl: "הזן את כתובת ה- URL של שירות העיבוד הגיאוגרפי.",
      chooseItem: "בחר פריט שירות של עיבוד גיאוגרפי.",
      chooseTask: "בחר משימת עיבוד גיאוגרפי."
    },
    itemSelector: {
      map: "מפה",
      selectWebMap: "בחר Web Map",
      addMapFromOnlineOrPortal: "מצא והוסף web map בה יעשה שימוש מתוך המקורות הציבוריים של ArcGIS Online, התוכן הפרטי שלך בתוך ArcGIS Online או הפורטל.",
      searchMapName: "חפש לפי שם מפה...",
      searchNone: "לא מצאנו את מה שחיפשת. נסה בבקשה שנית.",
      groups: "קבוצות",
      noneGroups: "אין קבוצות",
      signInTip: "פג תוקף משך זמן ההתחברות. רענן בבקשה את הדפדפן שלך בשביל להתחבר לפורטל שלך שוב.",
      signIn: "התחבר",
      publicMap: "כללי",
      myOrganization: "הארגון שלי",
      myGroup: "הקבוצות שלי",
      myContent: "התוכן שלי",
      count: "ספירה",
      fromPortal: "מהפורטל",
      fromOnline: "מתוך ArcGIS.com",
      noneThumbnail: "תמונה ממוזערת אינה זמינה",
      owner: "יוצר",
      signInTo: "התחבר אל",
      lastModified: "שונה לאחרונה",
      moreDetails: "פרטים נוספים"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "השירות אינו תומך בשאילתה."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "אין שכבה זמינה במפה."
    },
    layerInfosMenu: {
      titleBasemap: 'מפות בסיס',
      titleLayers: 'שכבות תפעוליות',
      labelLayer: 'שם שכבה',
      itemZoomTo: 'התמקד אל',
      itemTransparency: 'שקיפות',
      itemTransparent: 'שקוף',
      itemOpaque: 'אטום',
      itemMoveUp: 'הזז למעלה',
      itemMoveDown: 'הזז למטה',
      itemDesc: 'תיאור',
      itemDownload: 'הורד',
      itemToAttributeTable: 'פתח טבלת מאפיינים'
    },
    imageChooser: {
      unsupportReaderAPI: "לביצוע: דפדפן לא תומך ב-API של קריאת קבצים",
      readError: "קריאת הקובץ נכשלה.",
      invalidType: "סוג קובץ לא חוקי.",
      exceed: "גודל הקובץ אינו יכול להיות יותר מ-‎1024 KB",
      enableFlash: "לביצוע: הפעל Flash.",
      toolTip: "לקבלת תוצאות מיטביות, הקובץ צריך להיות ברוחב של ${width} פיקסלים ובגובה של ${height} פיקסלים. גדלים אחרים יותאמו. פורמטי התמונות שיתקבלו הם: PNG,‏ GIF ו-JPEG."
    },
    simpleTable: {
      moveUp: 'הזז למעלה',
      moveDown: 'הזז למטה',
      deleteRow: 'מחק',
      edit: 'עריכה'
    }
  })
);
