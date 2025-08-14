import { Component, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  Validators,
  UntypedFormGroup,
} from "@angular/forms";

@Component({
  selector: "app-add-branch",
  templateUrl: "./add-branch.component.html",
  styleUrls: ["./add-branch.component.scss"],
})
export class AddBranchComponent implements OnInit {
  addAreaForm: UntypedFormGroup;
  submit: boolean = false;
  isEditMode: boolean = false;
  editingEventId: string | null = null;

  constructor(public formBuilder: UntypedFormBuilder) {}

  ngOnInit() {
    this.addAreaForm = this.formBuilder.group({
      areaName: [
        "",
        [Validators.required, Validators.pattern("[a-zA-Z0-9\\s]+")],
      ],
      district: [
        "",
        [Validators.required, Validators.pattern("[a-zA-Z0-9\\s]+")],
      ],
      areaCoverage: [
        "",
        [Validators.required, Validators.pattern("[0-9]+(.[0-9]+)?")],
      ],
    });

    // Add keyboard event listener for Escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.closeModal();
      }
    });
  }

  get form() {
    return this.addAreaForm.controls;
  }

  validSubmit() {
    this.submit = true;
    if (this.addAreaForm.valid) {
      if (this.isEditMode) {
        console.log("Updating area:", this.addAreaForm.value);
        // Call update API
        // this.areaService.updateArea(this.editingEventId, this.addAreaForm.value);
      } else {
        console.log("Adding new area:", this.addAreaForm.value);
        // Call add API
        // this.areaService.addArea(this.addAreaForm.value);
      }

      // Close the modal after successful submission
      setTimeout(() => {
        this.closeModal();
        this.resetForm();
      }, 1000);
    }
  }

  resetForm() {
    this.submit = false;
    this.addAreaForm.reset();
    this.isEditMode = false;
    this.editingEventId = null;
  }

  populateFormForEdit(eventData: any): void {
    this.isEditMode = true;
    this.editingEventId = eventData.id;
    this.addAreaForm.patchValue({
      areaName: eventData.areaName,
      district: eventData.district,
      areaCoverage: eventData.areaCoverage,
    });
  }

  closeModal() {
    const modal = document.getElementById("addAreaModal");
    if (modal) {
      // Try using Bootstrap 5 modal if available
      if (
        typeof (window as any).bootstrap !== "undefined" &&
        (window as any).bootstrap.Modal
      ) {
        const bootstrapModal = (window as any).bootstrap.Modal.getInstance(
          modal
        );
        if (bootstrapModal) {
          bootstrapModal.hide();
        }
      } else {
        // Fallback: manually hide the modal
        modal.classList.remove("show");
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");

        // Remove backdrop
        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) {
          backdrop.remove();
        }

        // Remove body class
        document.body.classList.remove("modal-open");
      }
    }
  }
}
