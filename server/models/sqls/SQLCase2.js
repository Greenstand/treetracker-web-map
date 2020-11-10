/*
 * Search DB by trees table directly, like in the high zoom level, show trees
 * on the map;
 */

class SQLCase2{
  

  addTreeFilter(treeid){
    this.treeid = treeid;
  }

  addTreesFilter(treeIds){
    this.treeIds = treeIds;
  }

  addFilterByUserId(userId){
    this.userId = userId;
  }

  addFilterByWallet(wallet){
    this.wallet = wallet;
  }

  addFilterByFlavor(flavor){
    this.flavor = flavor;
  }

  getFilter(){
    let result = "";
    if(this.treeid){
      result += 'AND trees.id = ' + this.treeid + ' \n';
    }
    if(this.treeIds && this.treeIds.length > 0){
      result += "AND trees.id IN(" + this.treeIds.join(",") + ") ";
    }
    if(this.userId){
      result += "AND trees.planter_id = " + this.userId + " \n";
    }
    if(this.userId){
      result += "AND trees.planter_id = " + this.userId + " \n";
    }
    if(this.wallet) {
      result += "AND entity.wallet = '" + this.wallet + "'"
    }
    return result;
  }

  setBounds(bounds){
    this.bounds = bounds;
  }

  getBoundingBoxQuery(){
    let result = "";
    if (this.bounds) {
      result += 'AND trees.estimated_geometric_location && ST_MakeEnvelope(' + this.bounds + ', 4326) ';
    }
    return result;
  }

  getJoinCriteria(){
    let result = "";
    if(this.flavor){
      result += "AND tree_attributes.key = 'app_flavor' AND tree_attributes.value = '" + this.flavor + "'";
    }
    return result;
  }

  check(){
    if(!this.bounds && !this.treeid && !this.treeIds && !this.userId && !this.wallet && !this.flavor){
      throw new Error("please narrow down the data set");
    }
  }

  getJoin(){
    let result = "";
    if(this.wallet){
      result += 'INNER JOIN token ON token.tree_id = trees.id \n';
      result += 'INNER JOIN entity ON entity.id = token.entity_id \n';
    }
    if(this.flavor){
      result += "INNER JOIN tree_attributes ON tree_attributes.tree_id = trees.id";
    }
    return result;
  }

  getQuery(){
    this.check();
    let sql = `
      /* sql case2 */
      SELECT DISTINCT ON(trees.id)
      'point' AS type,
       trees.*, planter.first_name as first_name, planter.last_name as last_name,
      planter.image_url as user_image_url `
      + /*select + */ `
      FROM trees 
      ${this.getJoin()}
      INNER JOIN planter
      ON planter.id = trees.planter_id
      LEFT JOIN note_trees
      ON note_trees.tree_id = trees.id
      LEFT JOIN notes
      ON notes.id = note_trees.note_id
      WHERE active = true 
      ${this.getBoundingBoxQuery()}
      ${this.getFilter()}
      ${this.getJoinCriteria()}
    ` 
//      `${this.treeIds && this.treeIds.length > 0 ?
//          " and trees.id in(" + this.treeIds.join(",") + ") "
//          :
//          " "
//      }`
    ;
    console.log(sql);

    const query = {
      text: sql,
      values: [],
    };
    return query;
  }
}


module.exports = SQLCase2;
