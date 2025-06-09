
export const showLoadingSpinner = () => {
    const spinner = document.querySelector(".spinner") as HTMLElement;
    if (spinner) {
        spinner.style.display = "block";
    }
};


export const hideLoadingSpinner = () => {
    const spinner = document.querySelector(".spinner")  as HTMLElement;;
    if (spinner) {
        spinner.style.display = "none";
    }
};
