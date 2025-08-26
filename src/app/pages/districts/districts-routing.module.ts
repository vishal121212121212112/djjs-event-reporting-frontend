import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { TableComponent } from "./table/table.component";
import { AddDistrictComponent } from "./add-branch/add-branch.component";

const routes: Routes = [
  {
    path: "",
    component: TableComponent,
  },
  {
    path: "add",
    component: AddDistrictComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DistrictRoutingModule {}
