import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BranchListComponent } from './branch-list/branch-list.component';
import { ListBranchAssistanceComponent } from './branchAssistance/list-branch-assistance/list-branch-assistance.component';
import { AddBranchAssistanceComponent } from './branchAssistance/add-branch-assistance/add-branch-assistance.component';
import { EditBranchAssistanceComponent } from './branchAssistance/edit-branch-assistance/edit-branch-assistance.component';
import { AddBranchComponent } from './add-branch/add-branch.component';
import { EditBranchComponent } from './edit-branch/edit-branch.component';


const routes: Routes = [
  { path: "", component: BranchListComponent },
  { path: "add", component: AddBranchComponent },
  { path: "edit/:id", component: EditBranchComponent },
  { path: "branchAssistance", component: ListBranchAssistanceComponent },
  { path: "branchAssistance/add", component: AddBranchAssistanceComponent },
  { path: "branchAssistance/edit/:id", component: EditBranchAssistanceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BranchRoutingModule { }
