HTTP API for performing CRUD operations on Khan Academy Topics.json (KAT) structured files.  At the moment, when creating a new item in a KAT file (HTTP POST) and there are parts of the topic tree that need to be built to reach the path of the item being added, a CouchDB backend is required to fetch data to fill the gaps.  This could however be refactored to use another KAT file to fill the gaps but for the size of data that the OWL project is looking to pack into the parent topic tree, working with the entire parent library as a KAT file may not be the best fit for performance reasons. Feel free to prove me wrong though! :)
