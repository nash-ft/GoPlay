document.addEventListener("click", async (event) => {

    const button = event.target.closest(".remove-btn");

    if (!button) return;

    const response = await fetch(`/api/favourites/${button.dataset.id}`, {

        method: "DELETE"

    });

    if (response.ok) {

        button.closest(".col-lg-4").remove();

    }

});