import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { TableComponent } from "./table/table.component";
import { AddBranchComponent } from "./add-branch/add-branch.component";

const routes: Routes = [
  {
    path: "",
    component: TableComponent,
  },
  {
    path: "add",
    component: AddBranchComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AreaRoutingModule {}
