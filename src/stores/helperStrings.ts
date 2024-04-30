function projekt(): string[] {
    return [
        "Auf dieser Seite lässt sich das Projekt konfigurieren sowie die Buckets bearbeiten",
        "Um die Buckets zu bearbeiten, muss man auf das Bucket klicken",
        "Die Buckets können durch einen Doppelklick umbenannt werden",
        "Über die Pfeile neben den Buckets lässt sich die Reihenfolge anpassen",
        "Das hat eine Auswirkung auf die Darstellung der Reihenfolge innerhalb der Anwendung"
    ]
}

function pakete(): string[] {
    return [
        "Auf dieser Seite befinden sich alle Arbeitspakete",
        "Arbeitspakete können aus anderen Arbeitspaketen bestehen",
        "Arbeitspakete lassen sich mit F2 oder einem Doppelklick editieren",
        "Arbeitspakete, welche aus weiteren Arbeitspaketen bestehen, können weder geschätzt noch einem Bucket zugewiesen werden",
        "Mit Rechtsklick auf eine Zeile gibt es mehr Optionen, die ebenfalls mit Tastatur-Shortcuts zu erreichen sind",
        "Arbeitspaket mit unterem Paket auf gleicher Ebene vertauschen: (STRG oder Shift) und Pfeiltaste nach unten ",
        "Neues Arbeitspaket auf gleicher Ebene anlegen: Taste Plus",
        "Neues Arbeitspaket als Kind vom aktuellen Paket anlegen: Shift und Taste Plus",
        "Arbeitspaket mit oberem Paket auf gleicher Ebene vertauschen: (STRG oder Shift) und Pfeiltaste nach oben ",
        "Arbeitspaket als Kindpaket an unteres Paket hängen: STRG und Pfeiltaste nach rechts",
        "Arbeitspaket als Kindpaket an oberes Paket hängen: Shift und Pfeiltaste nach rechts",
        "Arbeitspaket als Geschwisterelement unter sein aktuelles Elternpaket verschieben: STRG und Pfeiltaste nach links",
        "Arbeitspaket als Geschwisterelement über sein aktuelles Elternpaket verschieben: Shift und Pfeiltaste nach links",
        "Arbeitspaket löschen: (STRG oder Shift) und Entfernen",
        "Arbeitspaket auf- und zuklappen: (STRG oder Shift) und Entfernen",
    ]
}

function vergleich(): string[] {
    return [
        "Auf dieser Seite befindet sich der visuelle Vergleich der Arbeitspakete bzgl. ihres Buckets",
        "Die Arbeitspakete lassen sich hier in ihren Buckets nebeneinander tabellarisch auflisten",
        "Links sieht man alle uneinsortierten Arbeitspakete",
        "Um ein Arbeitspaket einem Bucket zuzuweisen, muss man die Rechtecke in das zugehörige Bucket ziehen",
        "Um ein Arbeitspaket keinem Bucket mehr zuzuweisen, muss man das Paket in die Liste links ziehen"
    ]
}

function statistiken(): string[] {
    return [
        "Auf dieser Seite befinden sich alle Statisitken zu den Schätzungen der Arbeitspakete"
    ]
}

function aufschlaege(): string[] {
    return [
        "Auf dieser befinden sich die Projektaufschlaege",
        "Die Startsumme wird aus dem Gesamtaufwand gebildet, der aus der durchschnittlichen Summe der Statistiken entsteht",
        "Eine Zwischensumme ist dafür da, um eine neue Basis für alle prozentualen Aufschläge nach der Zwischensumme zu bilden",
        "Mit Rechtsklick auf eine Zeile gibt es mehr Optionen, die ebenfalls mit Tastatur-Shortcuts zu erreichen sind",
        "Neuen Aufschlag hinzufügen: Taste Plus",
        "Neue Zwischensumme hinzufügen: Shift und Taste Plus",
        "Aufschlag mit unterem Aufschlag vertauschen: (STRG oder Shift) und Pfeiltaste nach unten",
        "Aufschlag mit oberem Aufschlag vertauschen: (STRG oder Shift) und Pfeiltaste nach oben",
        "Aufschlag löschen: (STRG oder Shift) und Entfernen"
    ]
}

export {
    projekt,
    pakete,
    vergleich,
    statistiken,
    aufschlaege
}