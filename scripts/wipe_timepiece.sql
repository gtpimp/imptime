
-- this will delete lots of stuff and basically undo all your good look, be careful!

truncate timepiece_attribute, timepiece_project, timepiece_projectrelationship, timepiece_entry, timepiece_projectcontract, timepiece_entrygroup, timepiece_projecthours, timepiece_projectrelationship, timepiece_projectrelationship_types, timepiece_contractassignment, timepiece_contractmilestone, timepiece_assignmentallocation;

-- just delete entries and projects


truncate timepiece_project, timepiece_projectrelationship, timepiece_entry, timepiece_projectcontract, timepiece_entrygroup, timepiece_projecthours, timepiece_projectrelationship, timepiece_contractassignment, timepiece_contractmilestone, timepiece_assignmentallocation;