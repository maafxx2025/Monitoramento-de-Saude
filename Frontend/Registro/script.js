document.addEventListener("DOMContentLoaded", function () {
    const chronicConditions = document.getElementById("chronic-conditions");
    const choices = new Choices(chronicConditions, {
        removeItemButton: true,
        placeholderValue: 'Selecione...',
        searchPlaceholderValue: 'Buscar...',
        itemSelectText: '', // remove o "Press to select"
    });
});