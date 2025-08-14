import { Component, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  Validators,
  UntypedFormGroup,
} from "@angular/forms";

@Component({
  selector: "app-add-district",
  templateUrl: "./add-branch.component.html",
  styleUrls: ["./add-branch.component.scss"],
})
export class AddDistrictComponent implements OnInit {
  addDistrictForm: UntypedFormGroup;
  submit: boolean = false;
  isEditMode: boolean = false;
  editingEventId: string | null = null;

  // State and District data
  states = [
    { value: "maharashtra", label: "Maharashtra" },
    { value: "karnataka", label: "Karnataka" },
    { value: "tamil-nadu", label: "Tamil Nadu" },
    { value: "telangana", label: "Telangana" },
    { value: "andhra-pradesh", label: "Andhra Pradesh" },
    { value: "kerala", label: "Kerala" },
    { value: "gujarat", label: "Gujarat" },
    { value: "rajasthan", label: "Rajasthan" },
    { value: "madhya-pradesh", label: "Madhya Pradesh" },
    { value: "uttar-pradesh", label: "Uttar Pradesh" },
  ];

  districts: { [key: string]: Array<{ value: string; label: string }> } = {
    maharashtra: [
      { value: "mumbai", label: "Mumbai" },
      { value: "pune", label: "Pune" },
      { value: "nagpur", label: "Nagpur" },
      { value: "thane", label: "Thane" },
      { value: "nashik", label: "Nashik" },
    ],
    karnataka: [
      { value: "bangalore", label: "Bangalore" },
      { value: "mysore", label: "Mysore" },
      { value: "mangalore", label: "Mangalore" },
      { value: "hubli", label: "Hubli" },
      { value: "belgaum", label: "Belgaum" },
    ],
    "tamil-nadu": [
      { value: "chennai", label: "Chennai" },
      { value: "coimbatore", label: "Coimbatore" },
      { value: "madurai", label: "Madurai" },
      { value: "salem", label: "Salem" },
      { value: "tiruchirappalli", label: "Tiruchirappalli" },
    ],
    telangana: [
      { value: "hyderabad", label: "Hyderabad" },
      { value: "warangal", label: "Warangal" },
      { value: "karimnagar", label: "Karimnagar" },
      { value: "nizamabad", label: "Nizamabad" },
      { value: "adilabad", label: "Adilabad" },
    ],
    "andhra-pradesh": [
      { value: "vijayawada", label: "Vijayawada" },
      { value: "visakhapatnam", label: "Visakhapatnam" },
      { value: "guntur", label: "Guntur" },
      { value: "nellore", label: "Nellore" },
      { value: "kurnool", label: "Kurnool" },
    ],
    kerala: [
      { value: "thiruvananthapuram", label: "Thiruvananthapuram" },
      { value: "kochi", label: "Kochi" },
      { value: "kozhikode", label: "Kozhikode" },
      { value: "thrissur", label: "Thrissur" },
      { value: "kollam", label: "Kollam" },
    ],
    gujarat: [
      { value: "ahmedabad", label: "Ahmedabad" },
      { value: "surat", label: "Surat" },
      { value: "vadodara", label: "Vadodara" },
      { value: "rajkot", label: "Rajkot" },
      { value: "bhavnagar", label: "Bhavnagar" },
    ],
    rajasthan: [
      { value: "jaipur", label: "Jaipur" },
      { value: "jodhpur", label: "Jodhpur" },
      { value: "kota", label: "Kota" },
      { value: "bikaner", label: "Bikaner" },
      { value: "ajmer", label: "Ajmer" },
    ],
    "madhya-pradesh": [
      { value: "bhopal", label: "Bhopal" },
      { value: "indore", label: "Indore" },
      { value: "jabalpur", label: "Jabalpur" },
      { value: "gwalior", label: "Gwalior" },
      { value: "ujjain", label: "Ujjain" },
    ],
    "uttar-pradesh": [
      { value: "lucknow", label: "Lucknow" },
      { value: "kanpur", label: "Kanpur" },
      { value: "varanasi", label: "Varanasi" },
      { value: "agra", label: "Agra" },
      { value: "allahabad", label: "Allahabad" },
    ],
  };

  availableDistricts: Array<{ value: string; label: string }> = [];

  constructor(public formBuilder: UntypedFormBuilder) {}

  ngOnInit() {
    this.addDistrictForm = this.formBuilder.group({
      state: ["", [Validators.required]],
      district: ["", [Validators.required]],
    });

    // Listen to state changes to update available districts
    this.addDistrictForm
      .get("state")
      ?.valueChanges.subscribe((selectedState) => {
        this.onStateChange(selectedState);
      });

    // Add keyboard event listener for Escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.closeModal();
      }
    });
  }

  get form() {
    return this.addDistrictForm.controls;
  }

  onStateChange(selectedState: string): void {
    if (selectedState) {
      this.availableDistricts = this.districts[selectedState] || [];
      // Reset district selection when state changes
      this.addDistrictForm.patchValue({ district: "" });
    } else {
      this.availableDistricts = [];
      this.addDistrictForm.patchValue({ district: "" });
    }
  }

  validSubmit() {
    this.submit = true;
    if (this.addDistrictForm.valid) {
      if (this.isEditMode) {
        console.log("Updating district:", this.addDistrictForm.value);
        // Call update API
        // this.districtService.updateDistrict(this.editingEventId, this.addDistrictForm.value);
      } else {
        console.log("Adding new district:", this.addDistrictForm.value);
        // Call add API
        // this.districtService.addDistrict(this.addDistrictForm.value);
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
    this.addDistrictForm.reset();
    this.availableDistricts = [];
    this.isEditMode = false;
    this.editingEventId = null;
  }

  populateFormForEdit(eventData: any): void {
    this.isEditMode = true;
    this.editingEventId = eventData.id;

    // Set the state first to enable district selection
    this.addDistrictForm.patchValue({
      state: this.findStateByLabel(eventData.state),
      district: eventData.district,
    });

    // Trigger state change to populate districts
    this.onStateChange(this.findStateByLabel(eventData.state));
  }

  findStateByLabel(stateLabel: string): string {
    const state = this.states.find((s) => s.label === stateLabel);
    return state ? state.value : "";
  }

  closeModal() {
    const modal = document.getElementById("addDistrictModal");
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
