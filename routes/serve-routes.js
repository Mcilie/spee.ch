function serveFile(fileInfo, res){
	// set default options
	var options = {
		headers: { 
			"X-Content-Type-Options": "nosniff",
			"Content-Type": fileInfo.content_type
		}
	};
	// adjust default options as needed
	switch (fileInfo.content_type){
		case "image/jpeg":
			break;
		case "image/gif":
			break;
		case "image/png":
			break;
		case "video/mp4":
			break;
		default:
			console.log("sending unknown file type as .jpeg");
			options["headers"]["Content-Type"] = "image/jpeg";
			break;
	}
	// send file
	res.status(200).sendFile(fileInfo.download_path, options);
}

module.exports = function(app, routeHelpers, lbryHelpers, ua, googleAnalyticsId){
	// route to fetch one free public claim 
	app.get("/:name/:claim_id", function(req, res){
		var routeString = req.params.name + "/" + req.params.claim_id;
		// google analytics
		ua(googleAnalyticsId, {https: true}).event("Serve Route", "/name/claimId", routeString).send();
		// begin image-serve processes
		console.log(">> GET request on /" + routeString);
		lbryHelpers.getClaimBasedOnUri(req.params.name, req.params.claim_id)
		.then(function(fileInfo){
			console.log("/:name/:claim_id success.", fileInfo.file_name);
			serveFile(fileInfo, res);
		}).catch(function(error){
			console.log("/:name/:claim_id error:", error)
			routeHelpers.handleRequestError(error, res);
		});
	});
	// route to fetch one free public claim 
	app.get("/:name", function(req, res){
		// google analytics
		ua(googleAnalyticsId, {https: true}).event("Serve Route", "/name", req.params.name).send();
		// begin image-serve processes
		console.log(">> GET request on /" + req.params.name);
		lbryHelpers.getClaimBasedOnNameOnly(req.params.name)
		.then(function(fileInfo){
			console.log("/:name success.", fileInfo.file_name);
			serveFile(fileInfo, res);
		}).catch(function(error){
			console.log("/:name error:", error);
			routeHelpers.handleRequestError(error, res);
		});
	});
}