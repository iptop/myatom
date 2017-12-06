(function() {
  var config,
    slice = [].slice;

  config = require("./config");

  module.exports = {
    siteEngine: {
      title: "Site Engine",
      type: "string",
      "default": config.getDefault("siteEngine"),
      "enum": [config.getDefault("siteEngine")].concat(slice.call(config.engineNames()))
    },
    siteUrl: {
      title: "Site URL",
      type: "string",
      "default": config.getDefault("siteUrl")
    },
    siteLocalDir: {
      title: "Site Local Directory",
      description: "The absolute path to your site's local directory",
      type: "string",
      "default": config.getDefault("siteLocalDir")
    },
    siteDraftsDir: {
      title: "Site Drafts Directory",
      description: "The relative path from your site's local directory",
      type: "string",
      "default": config.getDefault("siteDraftsDir")
    },
    sitePostsDir: {
      title: "Site Posts Directory",
      description: "The relative path from your site's local directory",
      type: "string",
      "default": config.getDefault("sitePostsDir")
    },
    siteImagesDir: {
      title: "Site Images Directory",
      description: "The relative path from your site's local directory",
      type: "string",
      "default": config.getDefault("siteImagesDir")
    },
    urlForTags: {
      title: "URL to Tags JSON definitions",
      type: "string",
      "default": config.getDefault("urlForTags")
    },
    urlForPosts: {
      title: "URL to Posts JSON definitions",
      type: "string",
      "default": config.getDefault("urlForPosts")
    },
    urlForCategories: {
      title: "URL to Categories JSON definitions",
      type: "string",
      "default": config.getDefault("urlForCategories")
    },
    newDraftFileName: {
      title: "New Draft File Name",
      type: "string",
      "default": config.getCurrentDefault("newDraftFileName")
    },
    newPostFileName: {
      title: "New Post File Name",
      type: "string",
      "default": config.getCurrentDefault("newPostFileName")
    },
    fileExtension: {
      title: "File Extension",
      type: "string",
      "default": config.getCurrentDefault("fileExtension")
    },
    relativeImagePath: {
      title: "Use Relative Image Path",
      description: "Use relative image path from the open file",
      type: "boolean",
      "default": config.getCurrentDefault("relativeImagePath")
    },
    renameImageOnCopy: {
      title: "Rename Image File Name",
      description: "Rename image filename when you chose to copy to image directory",
      type: "boolean",
      "default": config.getCurrentDefault("renameImageOnCopy")
    },
    tableAlignment: {
      title: "Table Cell Alignment",
      type: "string",
      "default": config.getDefault("tableAlignment"),
      "enum": ["empty", "left", "right", "center"]
    },
    tableExtraPipes: {
      title: "Table Extra Pipes",
      description: "Insert extra pipes at the start and the end of the table rows",
      type: "boolean",
      "default": config.getDefault("tableExtraPipes")
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL2NvbmZpZy1iYXNpYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLE1BQUE7SUFBQTs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFVBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxhQUFQO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BQU0sQ0FBQyxVQUFQLENBQWtCLFlBQWxCLENBRlQ7TUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFPLENBQUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsWUFBbEIsQ0FBaUMsU0FBQSxXQUFBLE1BQU0sQ0FBQyxXQUFQLENBQUEsQ0FBQSxDQUFBLENBSHhDO0tBREY7SUFLQSxPQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sVUFBUDtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQUFNLENBQUMsVUFBUCxDQUFrQixTQUFsQixDQUZUO0tBTkY7SUFTQSxZQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sc0JBQVA7TUFDQSxXQUFBLEVBQWEsa0RBRGI7TUFFQSxJQUFBLEVBQU0sUUFGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsY0FBbEIsQ0FIVDtLQVZGO0lBY0EsYUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLHVCQUFQO01BQ0EsV0FBQSxFQUFhLG9EQURiO01BRUEsSUFBQSxFQUFNLFFBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BQU0sQ0FBQyxVQUFQLENBQWtCLGVBQWxCLENBSFQ7S0FmRjtJQW1CQSxZQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sc0JBQVA7TUFDQSxXQUFBLEVBQWEsb0RBRGI7TUFFQSxJQUFBLEVBQU0sUUFGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsY0FBbEIsQ0FIVDtLQXBCRjtJQXdCQSxhQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sdUJBQVA7TUFDQSxXQUFBLEVBQWEsb0RBRGI7TUFFQSxJQUFBLEVBQU0sUUFGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsZUFBbEIsQ0FIVDtLQXpCRjtJQTZCQSxVQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sOEJBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsWUFBbEIsQ0FGVDtLQTlCRjtJQWlDQSxXQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sK0JBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsYUFBbEIsQ0FGVDtLQWxDRjtJQXFDQSxnQkFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLG9DQUFQO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BQU0sQ0FBQyxVQUFQLENBQWtCLGtCQUFsQixDQUZUO0tBdENGO0lBeUNBLGdCQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8scUJBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFBTSxDQUFDLGlCQUFQLENBQXlCLGtCQUF6QixDQUZUO0tBMUNGO0lBNkNBLGVBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxvQkFBUDtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsaUJBQXpCLENBRlQ7S0E5Q0Y7SUFpREEsYUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLGdCQUFQO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixlQUF6QixDQUZUO0tBbERGO0lBcURBLGlCQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8seUJBQVA7TUFDQSxXQUFBLEVBQWEsNENBRGI7TUFFQSxJQUFBLEVBQU0sU0FGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFBTSxDQUFDLGlCQUFQLENBQXlCLG1CQUF6QixDQUhUO0tBdERGO0lBMERBLGlCQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sd0JBQVA7TUFDQSxXQUFBLEVBQWEsaUVBRGI7TUFFQSxJQUFBLEVBQU0sU0FGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFBTSxDQUFDLGlCQUFQLENBQXlCLG1CQUF6QixDQUhUO0tBM0RGO0lBK0RBLGNBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxzQkFBUDtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQUFNLENBQUMsVUFBUCxDQUFrQixnQkFBbEIsQ0FGVDtNQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsTUFBVixFQUFrQixPQUFsQixFQUEyQixRQUEzQixDQUhOO0tBaEVGO0lBb0VBLGVBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxtQkFBUDtNQUNBLFdBQUEsRUFBYSwrREFEYjtNQUVBLElBQUEsRUFBTSxTQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQUFNLENBQUMsVUFBUCxDQUFrQixpQkFBbEIsQ0FIVDtLQXJFRjs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbImNvbmZpZyA9IHJlcXVpcmUgXCIuL2NvbmZpZ1wiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgc2l0ZUVuZ2luZTpcbiAgICB0aXRsZTogXCJTaXRlIEVuZ2luZVwiXG4gICAgdHlwZTogXCJzdHJpbmdcIlxuICAgIGRlZmF1bHQ6IGNvbmZpZy5nZXREZWZhdWx0KFwic2l0ZUVuZ2luZVwiKVxuICAgIGVudW06IFtjb25maWcuZ2V0RGVmYXVsdChcInNpdGVFbmdpbmVcIiksIGNvbmZpZy5lbmdpbmVOYW1lcygpLi4uXVxuICBzaXRlVXJsOlxuICAgIHRpdGxlOiBcIlNpdGUgVVJMXCJcbiAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgZGVmYXVsdDogY29uZmlnLmdldERlZmF1bHQoXCJzaXRlVXJsXCIpXG4gIHNpdGVMb2NhbERpcjpcbiAgICB0aXRsZTogXCJTaXRlIExvY2FsIERpcmVjdG9yeVwiXG4gICAgZGVzY3JpcHRpb246IFwiVGhlIGFic29sdXRlIHBhdGggdG8geW91ciBzaXRlJ3MgbG9jYWwgZGlyZWN0b3J5XCJcbiAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgZGVmYXVsdDogY29uZmlnLmdldERlZmF1bHQoXCJzaXRlTG9jYWxEaXJcIilcbiAgc2l0ZURyYWZ0c0RpcjpcbiAgICB0aXRsZTogXCJTaXRlIERyYWZ0cyBEaXJlY3RvcnlcIlxuICAgIGRlc2NyaXB0aW9uOiBcIlRoZSByZWxhdGl2ZSBwYXRoIGZyb20geW91ciBzaXRlJ3MgbG9jYWwgZGlyZWN0b3J5XCJcbiAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgZGVmYXVsdDogY29uZmlnLmdldERlZmF1bHQoXCJzaXRlRHJhZnRzRGlyXCIpXG4gIHNpdGVQb3N0c0RpcjpcbiAgICB0aXRsZTogXCJTaXRlIFBvc3RzIERpcmVjdG9yeVwiXG4gICAgZGVzY3JpcHRpb246IFwiVGhlIHJlbGF0aXZlIHBhdGggZnJvbSB5b3VyIHNpdGUncyBsb2NhbCBkaXJlY3RvcnlcIlxuICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICBkZWZhdWx0OiBjb25maWcuZ2V0RGVmYXVsdChcInNpdGVQb3N0c0RpclwiKVxuICBzaXRlSW1hZ2VzRGlyOlxuICAgIHRpdGxlOiBcIlNpdGUgSW1hZ2VzIERpcmVjdG9yeVwiXG4gICAgZGVzY3JpcHRpb246IFwiVGhlIHJlbGF0aXZlIHBhdGggZnJvbSB5b3VyIHNpdGUncyBsb2NhbCBkaXJlY3RvcnlcIlxuICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICBkZWZhdWx0OiBjb25maWcuZ2V0RGVmYXVsdChcInNpdGVJbWFnZXNEaXJcIilcbiAgdXJsRm9yVGFnczpcbiAgICB0aXRsZTogXCJVUkwgdG8gVGFncyBKU09OIGRlZmluaXRpb25zXCJcbiAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgZGVmYXVsdDogY29uZmlnLmdldERlZmF1bHQoXCJ1cmxGb3JUYWdzXCIpXG4gIHVybEZvclBvc3RzOlxuICAgIHRpdGxlOiBcIlVSTCB0byBQb3N0cyBKU09OIGRlZmluaXRpb25zXCJcbiAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgZGVmYXVsdDogY29uZmlnLmdldERlZmF1bHQoXCJ1cmxGb3JQb3N0c1wiKVxuICB1cmxGb3JDYXRlZ29yaWVzOlxuICAgIHRpdGxlOiBcIlVSTCB0byBDYXRlZ29yaWVzIEpTT04gZGVmaW5pdGlvbnNcIlxuICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICBkZWZhdWx0OiBjb25maWcuZ2V0RGVmYXVsdChcInVybEZvckNhdGVnb3JpZXNcIilcbiAgbmV3RHJhZnRGaWxlTmFtZTpcbiAgICB0aXRsZTogXCJOZXcgRHJhZnQgRmlsZSBOYW1lXCJcbiAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgZGVmYXVsdDogY29uZmlnLmdldEN1cnJlbnREZWZhdWx0KFwibmV3RHJhZnRGaWxlTmFtZVwiKVxuICBuZXdQb3N0RmlsZU5hbWU6XG4gICAgdGl0bGU6IFwiTmV3IFBvc3QgRmlsZSBOYW1lXCJcbiAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgZGVmYXVsdDogY29uZmlnLmdldEN1cnJlbnREZWZhdWx0KFwibmV3UG9zdEZpbGVOYW1lXCIpXG4gIGZpbGVFeHRlbnNpb246XG4gICAgdGl0bGU6IFwiRmlsZSBFeHRlbnNpb25cIlxuICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICBkZWZhdWx0OiBjb25maWcuZ2V0Q3VycmVudERlZmF1bHQoXCJmaWxlRXh0ZW5zaW9uXCIpXG4gIHJlbGF0aXZlSW1hZ2VQYXRoOlxuICAgIHRpdGxlOiBcIlVzZSBSZWxhdGl2ZSBJbWFnZSBQYXRoXCJcbiAgICBkZXNjcmlwdGlvbjogXCJVc2UgcmVsYXRpdmUgaW1hZ2UgcGF0aCBmcm9tIHRoZSBvcGVuIGZpbGVcIlxuICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgZGVmYXVsdDogY29uZmlnLmdldEN1cnJlbnREZWZhdWx0KFwicmVsYXRpdmVJbWFnZVBhdGhcIilcbiAgcmVuYW1lSW1hZ2VPbkNvcHk6XG4gICAgdGl0bGU6IFwiUmVuYW1lIEltYWdlIEZpbGUgTmFtZVwiXG4gICAgZGVzY3JpcHRpb246IFwiUmVuYW1lIGltYWdlIGZpbGVuYW1lIHdoZW4geW91IGNob3NlIHRvIGNvcHkgdG8gaW1hZ2UgZGlyZWN0b3J5XCJcbiAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgIGRlZmF1bHQ6IGNvbmZpZy5nZXRDdXJyZW50RGVmYXVsdChcInJlbmFtZUltYWdlT25Db3B5XCIpXG4gIHRhYmxlQWxpZ25tZW50OlxuICAgIHRpdGxlOiBcIlRhYmxlIENlbGwgQWxpZ25tZW50XCJcbiAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgZGVmYXVsdDogY29uZmlnLmdldERlZmF1bHQoXCJ0YWJsZUFsaWdubWVudFwiKVxuICAgIGVudW06IFtcImVtcHR5XCIsIFwibGVmdFwiLCBcInJpZ2h0XCIsIFwiY2VudGVyXCJdXG4gIHRhYmxlRXh0cmFQaXBlczpcbiAgICB0aXRsZTogXCJUYWJsZSBFeHRyYSBQaXBlc1wiXG4gICAgZGVzY3JpcHRpb246IFwiSW5zZXJ0IGV4dHJhIHBpcGVzIGF0IHRoZSBzdGFydCBhbmQgdGhlIGVuZCBvZiB0aGUgdGFibGUgcm93c1wiXG4gICAgdHlwZTogXCJib29sZWFuXCJcbiAgICBkZWZhdWx0OiBjb25maWcuZ2V0RGVmYXVsdChcInRhYmxlRXh0cmFQaXBlc1wiKVxuIl19