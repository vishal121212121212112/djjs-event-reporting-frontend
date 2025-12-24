import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BranchListComponent } from './branch-list/branch-list.component';
import { ListBranchAssistanceComponent } from './branchAssistance/list-branch-assistance/list-branch-assistance.component';
import { AddBranchAssistanceComponent } from './branchAssistance/add-branch-assistance/add-branch-assistance.component';
import { EditBranchAssistanceComponent } from './branchAssistance/edit-branch-assistance/edit-branch-assistance.component';
import { AddBranchComponent } from './add-branch/add-branch.component';
import { EditBranchComponent } from './edit-branch/edit-branch.component';
import { ViewBranchComponent } from './view-branch/view-branch.component';
import { ViewMemberComponent } from './view-member/view-member.component';
import { AddMemberComponent } from './add-member/add-member.component';
import { AddChildBranchComponent } from './add-child-branch/add-child-branch.component';
import { EditChildBranchComponent } from './edit-child-branch/edit-child-branch.component';
import { ViewChildBranchComponent } from './view-child-branch/view-child-branch.component';
import { AddChildBranchMemberComponent } from './add-child-branch-member/add-child-branch-member.component';
import { BranchGalleryComponent } from './gallery/branch-gallery.component';
import { AllMembersComponent } from './all-members/all-members.component';


const routes: Routes = [
  { path: "", component: BranchListComponent },
  { path: "add", component: AddBranchComponent },
  { path: "edit/:id", component: EditBranchComponent },
  { path: "view/:id", component: ViewBranchComponent },
  { path: "child-branch/add/:parentId", component: AddChildBranchComponent },
  { path: "child-branch/edit/:id", component: EditChildBranchComponent },
  { path: "child-branch/view/:id", component: ViewChildBranchComponent },
  { path: "members", component: AllMembersComponent },
  { path: ":branchId/members/add", component: AddMemberComponent }, // Works for both parent and child branches
  { path: ":branchId/members/:memberId", component: ViewMemberComponent },
  { path: "gallery", component: BranchGalleryComponent },
  { path: "branchAssistance", component: ListBranchAssistanceComponent },
  { path: "branchAssistance/add", component: AddBranchAssistanceComponent },
  { path: "branchAssistance/edit/:id", component: EditBranchAssistanceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BranchRoutingModule { }
