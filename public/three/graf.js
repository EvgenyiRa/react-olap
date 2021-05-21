$(document).ready(function() {
    //let tableOLAP=$(window.opener.document).find('table.tableOLAP[id="'+window.table_id+'"]');
    let tableOLAP=$(window.tableHtml);
    var container = $('div.tree_graf');

    if ( WEBGL.isWebGLAvailable() === false ) {
        document.body.appendChild( WEBGL.getWebGLErrorMessage() );
    }
    THREE.Cache.enabled = true;

    var font_color_default=0x3a82f4;
    function createText(text,size,color) {
        if (!color) {
            color=font_color_default;
        }

        var materials = [
                        new THREE.MeshStandardMaterial( { color: color, flatShading: true } ), // front
                        new THREE.MeshStandardMaterial( { color: color } ) // side
                    ];

        var textGeo = new THREE.TextGeometry( text, {
                font: font,
                size: size,
                height: height_font,
                curveSegments: curveSegments,
                bevelThickness: bevelThickness,
                bevelSize: bevelSize,
                bevelEnabled: bevelEnabled
        } );
        textGeo.computeBoundingBox();
        textGeo.computeVertexNormals();
        if ( ! bevelEnabled ) {
                var triangleAreaHeuristics = 0.1 * ( height_font * size );
                for ( var i = 0; i < textGeo.faces.length; i ++ ) {
                        var face = textGeo.faces[ i ];
                        if ( face.materialIndex == 1 ) {
                                for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
                                        face.vertexNormals[ j ].z = 0;
                                        face.vertexNormals[ j ].normalize();
                                }
                                var va = textGeo.vertices[ face.a ];
                                var vb = textGeo.vertices[ face.b ];
                                var vc = textGeo.vertices[ face.c ];
                                var s = THREE.GeometryUtils.triangleArea( va, vb, vc );
                                if ( s > triangleAreaHeuristics ) {
                                        for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
                                                face.vertexNormals[ j ].copy( face.normal );
                                        }
                                }
                        }
                }
        }
        var centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
        textGeo = new THREE.BufferGeometry().fromGeometry( textGeo );
        var textMesh1 = new THREE.Mesh( textGeo, materials );
        textMesh1.position.x = centerOffset;
        textMesh1.position.y = hover;
        textMesh1.position.z = 0;
        textMesh1.rotation.x = 0;
        textMesh1.rotation.y = Math.PI * 2;
        //textMesh1.castShadow=true;
        //textMesh1.receiveShadow=true;
        return textMesh1;
}

    function loadFont() {
            var loader = new THREE.FontLoader();
            loader.load( '/three/fonts/' + fontName + '_' + fontWeight + '.typeface.json', function ( response ) {
                    font = response;
            } );
    }

    var width=window.innerWidth,
        height=window.innerHeight,
        //size = 1,
        hover = 0,
        curveSegments = 4,
        bevelThickness = 1,
        bevelSize = 0,
        bevelEnabled = false,
        font = undefined,
        fontName = "Times_New_Roman", // helvetiker, optimer, gentilis, droid sans, droid serif
        fontWeight = "regular",
        /*textMesh1,materials,*/x_group,y_group
        height_font=1;

   var fontMap = {
            "helvetiker": 0,
            "optimer": 1,
            "gentilis": 2,
            "droid/droid_sans": 3,
            "droid/droid_serif": 4
    };
    var weightMap = {
            "regular": 0,
            "bold": 1
    };
    var reverseFontMap = [];
    var reverseWeightMap = [];
    for ( var i in fontMap ) reverseFontMap[ fontMap[ i ] ] = i;
    for ( var i in weightMap ) reverseWeightMap[ weightMap[ i ] ] = i;

    var scene = new THREE.Scene();
    //scene.background = new THREE.Color(0xedf9f9);
    scene.background = new THREE.Color(0xffffff);
	var camera = new THREE.PerspectiveCamera(45
		, width / height , 0.1, 1000);
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);
        var interaction = new THREE.Interaction(renderer, scene, camera);

        var light = new THREE.AmbientLight( 0xffffff, 0.7 ); // soft white light
        scene.add( light );

        var dirLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
        dirLight.position.set( -220, 80, 0 ).normalize();
        scene.add( dirLight );

        var t_0_x=-70,
            t_0_y=-70,
            t_0_z=-70,
            t_max_x=70,
            t_max_y=70,
            t_max_z=70,

            t_0_x_pok=t_0_x-7,
            t_0_y_pok=98,
            t_0_z_pok=t_max_z+10,
            t_max_x_pok=95,
            t_max_y_pok=-95,
            t_max_z_pok=95,

            t_0_x_str=t_0_x-7,
            t_0_y_str=98,
            t_0_z_str=t_0_z-10,
            t_max_x_str=95,
            t_max_y_str=-95,
            t_max_z_str=-95;

        var material_x = new THREE.LineBasicMaterial({ color: 0x0000ff,linewidth: 5 });
        var geometry_x = new THREE.Geometry();
        geometry_x.vertices.push(new THREE.Vector3(t_0_x, t_0_y, t_0_z));//xyz
        geometry_x.vertices.push(new THREE.Vector3(t_0_x, t_0_y,t_max_z));
        var os_x = new THREE.Line(geometry_x, material_x);
        scene.add(os_x);

        var geometry_xk = new THREE.CylinderGeometry( 0, 1, 5, 32 ); // Геометрия (радиус вверху, радиус внизу, длина, число сегментов
        var material_xk = new THREE.MeshBasicMaterial( {color: 0x0000ff} ); // Материал
        var x_konus = new THREE.Mesh( geometry_xk, material_xk ); // Массив
        x_konus.rotation.x=0.5*Math.PI;
        x_konus.position.x = t_0_x;
        x_konus.position.y = t_0_y;
        x_konus.position.z = t_max_z;
        scene.add(x_konus);

        loadFont();

        var x_text='Показатели';
        //шах показателей, зазор между блоками
        var sh_pok,zazor=1;
        var mass_kor_pok=[],mass_kor_str=[],mass_max_zn_pok=[],mass_min_zn_pok=[],mass_pok=[],mass_pok_vector=[],mass_str=[],mass_str_vector=[],xdel_group=[],xdel_mesh_group=[],ydel_mesh_group=[],mass_zn_tek=[];
        var lightPoint,xdel_group_lightPoint,xdel_mesh_group_pl,xdel_group_pl,ydel_group=[],mass_pok_tree_call_min_max=[],mass_str_tree_call_min_max=[];

        function pok_tree_clear_group() {
            if (xdel_group_lightPoint) {
                xdel_group[xdel_group_lightPoint.t_count_all].children[0].material[0].color=new THREE.Color(font_color_default);
                scene.remove(xdel_group_lightPoint);
                xdel_group_lightPoint=undefined;
            }
            if (xdel_group_pl) {
                scene.remove(xdel_group_pl);
                xdel_group_pl.remove(xdel_mesh_group_pl);
                xdel_mesh_group_pl=undefined;
                xdel_group_pl=undefined;
            }
        }

        function pok_upd_str_act(this_xdel) {
            var x_pr_str_all=true;
            var x_pr_str_tree=false;
            for (var ii2 = 1; ii2 <=count_plan; ii2++) {
                if (!!ydel_group_lightPoint[ii2]) {
                    x_pr_str_all=false;
                    if (ydel_group_lightPoint[ii2].pr_tree) {
                        x_pr_str_tree=true;
                        mass_str_tree_call_min_max[0]=ydel_group_lightPoint[ii2].min_str_index;
                        mass_str_tree_call_min_max[1]=ydel_group_lightPoint[ii2].max_str_index;
                        str_upd_cube_opa(mass_str_tree_call_min_max,mass_pok_tree_call_min_max,undefined,this_xdel);
                    }
                    break;
                }
            }

            if (!x_pr_str_tree) {
                if (!x_pr_str_all) {
                    for (var ii2 = 1; ii2 <=count_plan; ii2++) {
                        if (!!ydel_group_lightPoint[ii2]) {
                            mass_str_tree_call_min_max[0]=ydel_group_lightPoint[ii2].min_str_index;
                            mass_str_tree_call_min_max[1]=ydel_group_lightPoint[ii2].max_str_index;
                            str_upd_cube_opa(mass_str_tree_call_min_max,mass_pok_tree_call_min_max,undefined,this_xdel);
                        }
                        else {
                            mass_str_tree_call_min_max[0]=ydel_group[mass_plan_index[ii2][0]].str_index;
                            mass_str_tree_call_min_max[1]=ydel_group[mass_plan_index[ii2][1]].str_index;
                            str_upd_cube_opa(mass_str_tree_call_min_max,mass_pok_tree_call_min_max,undefined,this_xdel);
                        }
                    }
                }
                else {
                    mass_str_tree_call_min_max[0]=0;
                    mass_str_tree_call_min_max[1]=mass_str.length-1;
                    str_upd_cube_opa(mass_str_tree_call_min_max,mass_pok_tree_call_min_max,undefined,this_xdel);
                }
            }
        }

        var MyIntervalID_X = setInterval(function(){
            //console.log('задержка');
            if (!!font) {
                clearInterval (MyIntervalID_X);
                x_group = new THREE.Group();
                if (x_text ) {
                    var x_mesh=createText(x_text,4);
                    x_group.add(x_mesh);
                }
                x_group.rotation.y=-0.5*Math.PI;
                x_group.position.x = t_0_x;
                x_group.position.y = t_0_y-7;
                x_group.position.z = t_max_z+10;
                scene.add(x_group);

                //создаем шкалу показателей
                        var id_t=window.table_id;
                        var table_par=tableOLAP;
                        var rep_tab_tr=$(table_par).find('tr');
                        var rep_tab=$(rep_tab_tr).find('td');
                        var begin_tab_td=$(rep_tab).first();
                        //var md=$(table_par).find('.masterdata[id="'+id_t+'"]');
                        var j=0;

                        var pok_max_length=0;
                        var mass_min_pok=[];
                        var mass_max_pok=[];

                         $(rep_tab).filter('.td_val_name').each(function(i,elem) {
                            j=0;
                            //console.log(elem);
                            mass_pok[i]=$(elem).text()+' ';
                            mass_pok_vector[i]=[];
                            mass_pok_vector[i][j]=$(elem).text();
                            j+=1;
                            $(rep_tab_tr).filter('.tr_pok:not(.null)').each(function(i2,elem2) {
                                //console.log(elem2);
                                if ($(elem2).find('td.td_pok_name').length==0) {
                                    var index_p=$(begin_tab_td).index()+(+$(begin_tab_td).attr('colspan')-1);
                                    $(elem2).find('td.td_pok').each(function(i21,elem211) {
                                        index_p+=+$(elem211).attr('colspan');
                                        if (index_p>=($(elem).index())) {
                                            mass_pok[i]+=$(elem211).text()+' ';
                                            mass_pok_vector[i][j]=$(elem211).text();

                                            if (!!!mass_min_pok[j]) {
                                                mass_min_pok[j]=mass_pok_vector[i][j].length;
                                            }
                                            else if (mass_pok_vector[i][j].length<mass_min_pok[j]) {
                                                mass_min_pok[j]=mass_pok_vector[i][j].length;
                                            }
                                            if (!!!mass_max_pok[j]) {
                                                mass_max_pok[j]=mass_pok_vector[i][j].length;
                                            }
                                            else if (mass_pok_vector[i][j].length>mass_max_pok[j]) {
                                                mass_max_pok[j]=mass_pok_vector[i][j].length;
                                            }
                                            j+=1;
                                            return false;
                                        }
                                    });
                                }
                            });

                            //вычисляем максимумы/минимумы значений показателей
                            $(rep_tab_tr).filter('.tr_tab').each(function(i,elem2) {
                                var tek_txt,
                                    elInput=$(elem2).find('td:eq('+$(elem).index()+') input:not([type="hidden"])');
                                if ($(elInput).length>0) {
                                    if ($(elInput).attr('type')==='checkbox') {
                                      if ($(elInput).prop('checked')) {
                                          tek_txt='1';
                                      }
                                      else {
                                          tek_txt='0';
                                      }
                                    }
                                    else {
                                        tek_txt=$(elInput).val();
                                    }
                                }
                                else {
                                  tek_txt=$(elem2).find('td:eq('+$(elem).index()+')').text().trim();
                                }
                                var tek_elem=parseFloat(tek_txt.replace(',','.'));
                                //console.log(tek_elem);
                                if ((!!!mass_max_zn_pok[$(elem).attr('id')]) & (!isNaN(tek_elem))) {
                                    //console.log(tek_elem);
                                    mass_max_zn_pok[$(elem).attr('id')]=tek_elem;
                                }
                                else if ((!!mass_max_zn_pok[$(elem).attr('id')]) & (!isNaN(tek_elem)) & (tek_elem>mass_max_zn_pok[$(elem).attr('id')])) {
                                    mass_max_zn_pok[$(elem).attr('id')]=tek_elem;
                                }
                                if ((!!!mass_min_zn_pok[$(elem).attr('id')]) & (!isNaN(tek_elem))) {
                                    //console.log(tek_elem);
                                    mass_min_zn_pok[$(elem).attr('id')]=tek_elem;
                                }
                                else if ((!!mass_min_zn_pok[$(elem).attr('id')]) & (!isNaN(tek_elem)) & (tek_elem<mass_min_zn_pok[$(elem).attr('id')])) {
                                    mass_min_zn_pok[$(elem).attr('id')]=tek_elem;
                                }
                                if ((tek_txt.length>0) & (isNaN(tek_elem))) {
                                    mass_zn_tek.push(tek_txt);
                                }
                            });

                            //console.log(mass_max_zn_pok);
                        });
                        mass_zn_tek=mass_zn_tek.filter((x, i, a) => ((a.indexOf(x) == i) & (x!='')));
                        //шах показателей
                        sh_pok=(t_max_z-t_0_z-mass_pok.length*zazor)/(mass_pok.length+1);
                        var t_k=t_0_z+sh_pok+zazor;
                        var max_count_pok_group_y=50;
                        var sh_pok_group_y=(t_0_y_pok-t_max_y_pok)/(max_count_pok_group_y+1);
                        var t_k_group_y=t_0_y_pok;
                        var t_k_group_z=t_0_z_pok;
                        var size_pok=3;
                        //console.log(mass_pok_vector);
                        var material_linex = new THREE.LineBasicMaterial({ color: 0x961596,linewidth: 5 });
                        var mass_pok_three,mass_pok_three_tek=[];
                        mass_pok_three='';
                        var count_pok_one=mass_pok_vector[0].length;
                        for (var i = 1; i <=(count_pok_one-1) ; i++) {
                            mass_pok_three_tek[i]='';
                        }
                        //console.log(mass_pok_three_tek);
                        //console.log(mass_pok_vector[0].length);
                        var t_count_all=0;
                        var mass_pok_three_tek=[];
                        var count_pok_one=mass_pok_vector[0].length;
                        for (var i = 1; i <=(count_pok_one-1) ; i++) {
                            mass_pok_three_tek[i]='';
                        }

                        var t_k_group_x=t_0_x_pok;

                        console.log(mass_pok_vector);
                        mass_pok_vector.forEach(function(element,index) {
                            var geometry_delx = new THREE.Geometry();
                            geometry_delx.vertices.push(new THREE.Vector3(t_0_x, t_0_y-1, t_k));//xyz
                            geometry_delx.vertices.push(new THREE.Vector3(t_0_x, t_0_y+1,t_k));
                            var del_x = new THREE.Line(geometry_delx, material_x);
                            scene.add(del_x);

                            //линии сетки
                            var geometry_linex = new THREE.Geometry();
                            geometry_linex.vertices.push(new THREE.Vector3(t_0_x, t_0_y, t_k));//xyz
                            geometry_linex.vertices.push(new THREE.Vector3(t_max_x, t_0_y,t_k));
                            var line_x = new THREE.Line(geometry_linex, material_linex);
                            scene.add(line_x);

                            t_k_group_z=t_0_z_pok;

                            var pr_uzel=false;
                            for (var i = 1; i <=(count_pok_one-1) ; i++) {
                                var text=String(element[i]);
                                if (text!==String(mass_pok_three_tek[i])) {
                                    //console.log(text);
                                    pr_uzel=true;
                                    break;
                                }
                            }
                            if (pr_uzel) {
                                for (var i2 = 1; i2 <=(count_pok_one-1); i2++) {
                                    //console.log(element[i]);
                                    mass_pok_three_tek[i2]=String(element[i2]);
                                }
                                if (i!=1) {
                                    for (var i2 = 1; i2 <i; i2++) {
                                        t_k_group_z+=String(element[i2]).length*size_pok/1.1;
                                    }
                                }
                                for (var i2 =i ; i2 <=(count_pok_one-1); i2++) {
                                    var text='* '+String(element[i2]);
                                    //console.log(mass_pok_three_tek);
                                    xdel_group[t_count_all] = new THREE.Group();
                                    xdel_group[t_count_all].pok_index=index;
                                    xdel_group[t_count_all].t_count_all=t_count_all;
                                    xdel_group[t_count_all].pok_tree_index=i2;
                                    xdel_group[t_count_all].pr_tree=true;
                                    if (text) {
                                        xdel_mesh_group[t_count_all]=createText(text,size_pok);
                                        xdel_group[t_count_all].add(xdel_mesh_group[t_count_all]);
                                    }
                                    xdel_group[t_count_all].rotation.y=-0.5*Math.PI;
                                    xdel_group[t_count_all].position.x = t_0_x_pok;
                                    xdel_group[t_count_all].position.y = t_k_group_y;
                                    xdel_group[t_count_all].position.z = t_k_group_z+((text.length)*size_pok/2/1.1);
                                    xdel_group[t_count_all].cursor = 'pointer';
                                    xdel_group[t_count_all].on('click', function(ev) {
                                        var this_pok_index=this.pok_index;
                                        var pr_end=false;
                                        var this_pok_tree_index=this.pok_tree_index;
                                        var pok_tree_value=String(mass_pok_vector[this_pok_index][this_pok_tree_index]);
                                        var this_t_count_all=this.t_count_all;
                                        mass_pok_tree_call_min_max[0]=this_pok_index;
                                        for (var ii2 = this_pok_index; ((ii2 <=(mass_pok.length-1)) & (!pr_end)); ii2++) {
                                            if (String(mass_pok_vector[ii2][this_pok_tree_index])!==pok_tree_value) {
                                                pr_end=true;
                                            }
                                        }
                                        if (pr_end) {
                                            mass_pok_tree_call_min_max[1]=ii2-2;
                                        }
                                        else
                                            mass_pok_tree_call_min_max[1]=mass_pok.length-1;
                                        //console.log(mass_pok_tree_call_min_max);

                                        pok_upd_str_act(this);

                                        if (!xdel_group_lightPoint) {
                                            //xdel_group_lightPoint = new THREE.PointLight( 0xea12d5, 150, size_pok*2);
                                            xdel_group_lightPoint = new THREE.RectAreaLight( 0xffffff, 1,  size_pok*mass_pok_vector[this_pok_index][this_pok_tree_index].length, size_pok );
                                        }
                                        else {
                                            xdel_group[xdel_group_lightPoint.t_count_all].children[0].material[0].color=new THREE.Color(font_color_default);
                                        }
                                        if (xdel_group_lightPoint.t_count_all!==this_t_count_all) {
                                            scene.add(xdel_group_lightPoint);
                                            xdel_group_lightPoint.pok_tree_index=this_pok_tree_index;
                                            xdel_group_lightPoint.pok_index=this_pok_index;
                                            xdel_group_lightPoint.t_count_all=this_t_count_all;
                                            xdel_group_lightPoint.pr_tree=true;
                                            xdel_group_lightPoint.min_pok_index=mass_pok_tree_call_min_max[0];
                                            xdel_group_lightPoint.max_pok_index=mass_pok_tree_call_min_max[1];
                                            xdel_group_lightPoint.position.set( this.position.x-1, this.position.y+size_pok/2, this.position.z);
                                            this.children[0].material[0].color=new THREE.Color(0xea12d5);
                                            if (xdel_group_pl) {
                                                scene.remove(xdel_group_pl);
                                                xdel_group_pl.remove(xdel_mesh_group_pl);
                                                xdel_mesh_group_pl=undefined;
                                                xdel_group_pl=undefined;
                                            }
                                        }
                                        else {
                                            pok_tree_clear_group();
                                        }

                                        cube_clear_group();


                                    });

                                    scene.add(xdel_group[t_count_all]);
                                    t_k_group_z+=mass_max_pok[i2]*size_pok/1.1;
                                    t_k_group_y-=sh_pok_group_y;
                                    t_count_all+=1;
                                }
                            }
                            else {
                                for (var i2 = 1; i2 <= (count_pok_one-1) ; i2++) {
                                    t_k_group_z+=mass_max_pok[i2]*size_pok/1.1;
                                }
                            }

                            //console.log(t_count_all);
                            //console.log(xdel_group);
                            i=0;
                            xdel_group[t_count_all] = new THREE.Group();
                            xdel_group[t_count_all].pok_index=index;
                            xdel_group[t_count_all].pok_tree_index=i;
                            xdel_group[t_count_all].t_count_all=t_count_all;
                            xdel_group[t_count_all].count_plan=count_plan;
                            var text=element[i];
                            if (text) {
                                xdel_mesh_group[t_count_all]=createText(text,size_pok);
                                xdel_group[t_count_all].add(xdel_mesh_group[t_count_all]);
                            }
                            xdel_group[t_count_all].rotation.y=-0.5*Math.PI;
                            xdel_group[t_count_all].position.x = t_0_x_pok;
                            xdel_group[t_count_all].position.y = t_k_group_y;
                            xdel_group[t_count_all].position.z = t_k_group_z+((text.length)*size_pok/2/1.1);

                            xdel_group[t_count_all].cursor = 'pointer';
                            xdel_group[t_count_all].on('click', function(ev) {
                                var this_pok_index=this.pok_index;
                                var this_t_count_all=this.t_count_all;
                                var this_pok_tree_index=this.pok_tree_index;
                                mass_pok_tree_call_min_max[0]=this_pok_index;
                                mass_pok_tree_call_min_max[1]=this_pok_index;
                                pok_upd_str_act(this);
                                if (!xdel_group_lightPoint) {
                                    //xdel_group_lightPoint = new THREE.PointLight( 0xea12d5, 150, size_pok*2);
                                    xdel_group_lightPoint = new THREE.RectAreaLight( 0xffffff, 1,  size_pok*mass_pok_vector[this_pok_index][this_pok_tree_index].length,size_pok);
                                    /*var rectLightHelper = new THREE.RectAreaLightHelper(xdel_group_lightPoint);
                                    scene.add( rectLightHelper );*/
                                }
                                else {
                                    xdel_group[xdel_group_lightPoint.t_count_all].children[0].material[0].color=new THREE.Color(font_color_default);
                                }
                                //this.remove(xdel_mesh_group[this_t_count_all]);
                                if (xdel_group_lightPoint.t_count_all!==this_t_count_all) {
                                    scene.add(xdel_group_lightPoint);
                                    xdel_group_lightPoint.pok_tree_index=this.pok_tree_index;
                                    xdel_group_lightPoint.pok_index=this_pok_index;
                                    xdel_group_lightPoint.t_count_all=this_t_count_all;
                                    xdel_group_lightPoint.min_pok_index=mass_pok_tree_call_min_max[0];
                                    xdel_group_lightPoint.max_pok_index=mass_pok_tree_call_min_max[1];
                                    xdel_group_lightPoint.position.set( this.position.x-1, this.position.y+size_pok/2, this.position.z);
                                    xdel_group_lightPoint.rotation.y=0.5*Math.PI;

                                    text=mass_pok[this_pok_index];
                                    //console.log(mass_pok[this_pok_index]);
                                    //console.log(mass_plan_index[this.count_plan][0]);
                                    if (text) {
                                        if (!xdel_group_pl) {
                                            console.log(xdel_group_pl);
                                            xdel_group_pl=new THREE.Group();
                                        }
                                        else if (xdel_mesh_group_pl){
                                            xdel_group_pl.remove(xdel_mesh_group_pl);
                                        }
                                        xdel_mesh_group_pl=createText(text,size_pok);
                                        xdel_group_pl.add(xdel_mesh_group_pl);
                                        xdel_group_pl.rotation.y=-0.5*Math.PI;
                                        xdel_group_pl.position.x = t_0_x_pok;
                                        xdel_group_pl.position.y = t_0_y+1;
                                        xdel_group_pl.position.z = mass_kor_pok[this_pok_index]/*-size_pok*text.length/1.3/2*/;
                                        scene.add(xdel_group_pl);
                                    }
                                    //xdel_mesh_group[this_t_count_all]=createText(mass_str_vector[this_str_index][this_str_tree_index],size_str,0xea12d5);
                                    this.children[0].material[0].color=new THREE.Color(0xea12d5);
                                }
                                else {
                                    pok_tree_clear_group(tek_count_plan);
                                    //xdel_mesh_group[this.t_count_all]=createText(mass_str_vector[this_str_index][this_str_tree_index],size_str);
                                }

                                cube_clear_group();
                                //this.add(xdel_mesh_group[this_t_count_all]);
                            });

                            scene.add(xdel_group[t_count_all]);

                            t_k_group_y-=sh_pok_group_y;
                            t_count_all+=1;
                            mass_kor_pok[index]=t_k;
                            t_k+=sh_pok+zazor;
                        });
                        t_count_all-=1;

            }
        },500);

        var material_y = new THREE.LineBasicMaterial({ color: 0x0000ff,linewidth: 5 });
        var geometry_y = new THREE.Geometry();
        geometry_y.vertices.push(new THREE.Vector3(t_0_x, t_0_y, t_0_z));//xyz
        geometry_y.vertices.push(new THREE.Vector3(t_max_x,t_0_y,t_0_z));
        var os_y = new THREE.Line(geometry_y, material_y);
        scene.add(os_y);

        var height_konus=5;
        var geometry_yk = new THREE.CylinderGeometry( 0, 1, height_konus, 32 ); // Геометрия (радиус вверху, радиус внизу, длина, число сегментов
        var material_yk = new THREE.MeshBasicMaterial( {color: 0x0000ff} ); // Материал
        var y_konus = new THREE.Mesh( geometry_yk, material_yk ); // Массив
        //y_konus.rotation.y=0.5*Math.PI;
        y_konus.rotation.z=-0.5*Math.PI;
        y_konus.position.x = t_max_x;
        y_konus.position.y = t_0_y;
        y_konus.position.z = t_0_z;
        scene.add(y_konus);


        var y_text='Строки';
        //шах строк
        var sh_str;
        var max_count_str_group_y=45;
        sh_str=(t_max_x-t_0_x-max_count_str_group_y*zazor)/(max_count_str_group_y);
        var mass_plan_index=[];
        var tek_count_plan=1;
        var count_plan=1;
        var size_str=2.5;
        var plan_txt_group=[];
        var mass_min_max_cube=[];
        var sphere=[];
        var lightPoint,ydel_group_lightPoint=[],ydel_mesh_group_pl,ydel_group_pl;

        function str_tree_update(this_plan_index) {
            if (tek_count_plan!=this_plan_index) {
                mass_min_max_cube[0]=ydel_group[mass_plan_index[tek_count_plan][0]].str_index;
                mass_min_max_cube[1]=ydel_group[mass_plan_index[tek_count_plan][1]].str_index;
                for (var i = mass_plan_index[tek_count_plan][0]; i <=mass_plan_index[tek_count_plan][1]; i++) {
                    if (!!ydel_group[i]) {
                            ydel_group[i].visible=false;
                    }
                }
                for (var i = mass_plan_index[this_plan_index][0]; i <=mass_plan_index[this_plan_index][1]; i++) {
                    if (!!ydel_group[i]) {
                        ydel_group[i].visible=true;
                    }
                }

                //удаление и добавление параллелограммов кубов
                for (var i = mass_min_max_cube[0]; i <= mass_min_max_cube[1] ; i++) {
                    for (var i2 = 0; i2 <= (mass_kor_pok.length -1) ; i2++) {
                        if (!!cube_mass[i][i2]) {
                            /*scene.remove(cube_mass[i][i2]);
                            delete cube_mass[i][i2];*/
                            cube_mass[i][i2].visible=false;
                        }
                    }
                }
                //console.log(mass_max_min_cube);
                mass_min_max_cube[0]=ydel_group[mass_plan_index[this_plan_index][0]].str_index;
                mass_min_max_cube[1]=ydel_group[mass_plan_index[this_plan_index][1]].str_index;
                for (var i = mass_min_max_cube[0]; i <= mass_min_max_cube[1] ; i++) {
                    for (var i2 = 0; i2 <= (mass_kor_pok.length -1) ; i2++) {
                        if (!!cube_mass[i][i2]) {
                            cube_mass[i][i2].visible=true;
                        }
                    }
                }

                if (ydel_group_lightPoint[tek_count_plan]) {
                    scene.remove(ydel_group_lightPoint[tek_count_plan]);

                    if (ydel_group_pl) {
                        scene.remove(ydel_group_pl);
                        ydel_group_pl.remove(ydel_mesh_group_pl);
                        ydel_mesh_group_pl=undefined;
                        ydel_group_pl=undefined;
                    }
                }

                if (ydel_group_lightPoint[this_plan_index]) {
                    scene.add(ydel_group_lightPoint[this_plan_index]);

                    if (!ydel_group_lightPoint[this_plan_index].pr_tree) {
                        var text=mass_str[ydel_group_lightPoint[this_plan_index].str_index];
                        if (text) {
                            if (!ydel_group_pl) {
                                ydel_group_pl=new THREE.Group();
                            }
                            else {
                                ydel_group_pl.remove(ydel_mesh_group_pl);
                            }
                            ydel_mesh_group_pl=createText(text,size_str);
                            ydel_group_pl.add(ydel_mesh_group_pl);
                            ydel_group_pl.rotation.y=-0.5*Math.PI;
                            ydel_group_pl.position.x = mass_kor_str[ydel_group_lightPoint[this_plan_index].str_index-ydel_group[mass_plan_index[this_plan_index][0]].str_index];
                            ydel_group_pl.position.y = t_0_y+2;
                            ydel_group_pl.position.z = t_0_z-size_str*text.length/1.3/2;
                            scene.add(ydel_group_pl);
                        }
                    }
                }

                lightPoint.position.set( sphere[this_plan_index].position.x-3, sphere[this_plan_index].position.y, sphere[this_plan_index].position.z);

                if (tek_cube_click[tek_count_plan]) {
                    cube_group.remove(cube_mesh);
                    cube_group_pok.remove(cube_mesh_pok);
                    cube_group_str.remove(cube_mesh_str);
                }
                if (tek_cube_click[this_plan_index]) {
                    var cube_one=cube_mass[tek_cube_click[this_plan_index]['mass_c_i']][tek_cube_click[this_plan_index]['mass_c_i2']];
                    cube_call_group(cube_one);
                }

                tek_count_plan=this_plan_index;

            }
        }

        function str_upd_cube_opa(mass_str_tree_call_min_max,mass_pok_tree_call_min_max,this_ydel_group,this_xdel_group) {
            var opa1,opa2,opa3=0.3;
            if (!!ydel_group_lightPoint[tek_count_plan]) {
                if (!!this_ydel_group) {
                    if (ydel_group_lightPoint[tek_count_plan].t_count_all!==this_ydel_group.t_count_all) {
                        opa1=0.3;
                        opa2=1;
                        opa3=0.3;
                    }
                    else {
                        opa1=1;
                        opa2=1;
                        opa3=1;
                    }
                }
                else {
                    opa1=0.3;
                    opa2=1;
                    opa3=0.3;
                }
            }
            else {
                opa1=0.3;
                opa2=1;
                opa3=0.3;
            }

            function str_upd_cube_opa_one_pok(tek_opa,i_tek) {
                var opa1pok=0.3;
                if (tek_opa==1) {
                    opa1pok=1;
                    if (xdel_group_lightPoint) {
                        if (!!this_xdel_group) {
                            if ((xdel_group_lightPoint.min_pok_index!==mass_pok_tree_call_min_max[0]) || (xdel_group_lightPoint.max_pok_index!==mass_pok_tree_call_min_max[1])) {
                                if ((i_tek>=mass_pok_tree_call_min_max[0]) & (i_tek<=mass_pok_tree_call_min_max[1])) {
                                    opa1pok=1;
                                }
                                else {
                                    opa1pok=0.3;
                                }
                            }
                            else {
                                opa1pok=1;
                            }
                        }
                        else {
                            if ((i_tek>=mass_pok_tree_call_min_max[0]) & (i_tek<=mass_pok_tree_call_min_max[1])) {
                                opa1pok=1;
                            }
                            else {
                                opa1pok=0.3;
                            }
                        }
                    }
                    else {
                        if ((i_tek>=mass_pok_tree_call_min_max[0]) & (i_tek<=mass_pok_tree_call_min_max[1])) {
                            opa1pok=1;
                        }
                        else {
                            opa1pok=0.3;
                        }
                    }
                }
                return opa1pok;
            }

            //ограниечение для узлов дерева распространяется на все страницы, значения только на одну
            var pr_tree_exist=false;
            if (!!this_ydel_group) {
                if (!this_ydel_group.pr_tree) {
                    for (var ii = 1; ii <= count_plan; ii++) {
                        if (ydel_group_lightPoint[ii]) {
                            if (ydel_group_lightPoint[ii].pr_tree) {
                                str_tree_clear_group(ii);
                                pr_tree_exist=true;
                                break;
                            }
                        }
                    }
                }
            }
            if (!!this_ydel_group) {
                if (!this_ydel_group.pr_tree) {
                    if (pr_tree_exist) {
                        for (var ii = 0; ii <= (ydel_group[mass_plan_index[tek_count_plan][0]].str_index-1); ii++) {
                            for (var ii2 = 0; ii2 <= (mass_kor_pok.length -1) ; ii2++) {
                                if (!!cube[ii][ii2]) {
                                    //cube_mass[ii][ii2].material.opacity = 1;
                                    cube_mass[ii][ii2].material.opacity=str_upd_cube_opa_one_pok(1,ii2);
                                }
                            }
                        }
                    }
                }
            }

            var beg2;
            if (!!this_ydel_group) {
                if (!this_ydel_group.pr_tree) {
                    beg2=ydel_group[mass_plan_index[tek_count_plan][0]].str_index;
                }
                else {
                    beg2=0;
                }
            }
            else {
                //beg2=0;
                beg2=mass_str_tree_call_min_max[0];
            }
            for (var ii = beg2; ii <= (mass_str_tree_call_min_max[0]-1); ii++) {
                for (var ii2 = 0; ii2 <= (mass_kor_pok.length -1) ; ii2++) {
                    if (!!cube[ii][ii2]) {
                        //cube_mass[ii][ii2].material.opacity = opa1;
                        cube_mass[ii][ii2].material.opacity=str_upd_cube_opa_one_pok(opa1,ii2);
                    }
                }
            }

            for (var ii = mass_str_tree_call_min_max[0]; ii <= mass_str_tree_call_min_max[1]; ii++) {
                for (var ii2 = 0; ii2 <= (mass_kor_pok.length -1) ; ii2++) {
                    if (!!cube[ii][ii2]) {
                        //cube_mass[ii][ii2].material.opacity = opa2;
                        cube_mass[ii][ii2].material.opacity=str_upd_cube_opa_one_pok(opa2,ii2);
                    }
                }
            }

            var end3;
            if (!!this_ydel_group) {
                if (!this_ydel_group.pr_tree) {
                    end3=ydel_group[mass_plan_index[tek_count_plan][1]].str_index;
                }
                else {
                    end3=(mass_str.length-1);
                }
            }
            else {
                //end3=(mass_str.length-1);
                end3=mass_str_tree_call_min_max[1];
            }
            for (var ii = (mass_str_tree_call_min_max[1]+1); ii <= end3; ii++) {
                for (var ii2 = 0; ii2 <= (mass_kor_pok.length -1) ; ii2++) {
                    if (!!cube[ii][ii2]) {
                        //cube_mass[ii][ii2].material.opacity = opa3;
                        cube_mass[ii][ii2].material.opacity=str_upd_cube_opa_one_pok(opa3,ii2);
                    }
                }
            }

            if (!!this_ydel_group) {
                if (!this_ydel_group.pr_tree) {
                    if (pr_tree_exist) {
                        for (var ii = (ydel_group[mass_plan_index[tek_count_plan][1]].str_index+1); ii <= (mass_str.length-1); ii++) {
                            for (var ii2 = 0; ii2 <= (mass_kor_pok.length -1) ; ii2++) {
                                if (!!cube[ii][ii2]) {
                                    //cube_mass[ii][ii2].material.opacity = 1;
                                    cube_mass[ii][ii2].material.opacity=str_upd_cube_opa_one_pok(1,ii2);
                                }
                            }
                        }
                    }
                }
            }
        }

        function str_add_tree_one(count_plan,t_k_group_three_z) {
            var sphereGeometry = new THREE.SphereGeometry(size_str*2,7,7);
            var sphereMaterial = new THREE.MeshLambertMaterial( {color: 0xa0068c,transparent: true,wireframe: true,opacity:0.1} );
            sphere[count_plan] = new THREE.Mesh(sphereGeometry,sphereMaterial);
            sphere[count_plan].position.x = t_0_x_str;
            sphere[count_plan].position.y = t_0_y_str+size_str*2;
            sphere[count_plan].position.z = t_k_group_three_z;
            sphere[count_plan].plan_index=count_plan;
            scene.add(sphere[count_plan]);
            var text=String(count_plan);
            plan_txt_group[count_plan] = new THREE.Group();
            var plan_txt_mesh2=createText(text,(size_str+2),0x962887);
            plan_txt_group[count_plan].add(plan_txt_mesh2);
            plan_txt_group[count_plan].plan_index=count_plan;
            plan_txt_group[count_plan].rotation.y=-0.5*Math.PI;
            plan_txt_group[count_plan].position.x = t_0_x_str;
            plan_txt_group[count_plan].position.y = t_0_y_str+size_str*2-size_str/2;
            plan_txt_group[count_plan].position.z = t_k_group_three_z;
            plan_txt_group[count_plan].plan_index=count_plan;
            sphere[count_plan].cursor = 'pointer';
            sphere[count_plan].on('click', function(ev) {
                var this_plan_index=this.plan_index;
                str_tree_update(this_plan_index);
            });
            scene.add(plan_txt_group[count_plan]);
        }

        function str_tree_clear_group(v_count_plan) {
            if (ydel_group_lightPoint[v_count_plan]) {
                ydel_group[ydel_group_lightPoint[v_count_plan].t_count_all].children[0].material[0].color=new THREE.Color(font_color_default);
                scene.remove(ydel_group_lightPoint[v_count_plan]);
                ydel_group_lightPoint[v_count_plan]=undefined;
            }
            if (ydel_group_pl) {
                scene.remove(ydel_group_pl);
                ydel_group_pl.remove(ydel_mesh_group_pl);
                ydel_mesh_group_pl=undefined;
                ydel_group_pl=undefined;
            }
        }

        function pok_tree_clear_group() {
            if (xdel_group_lightPoint) {
                xdel_group[xdel_group_lightPoint.t_count_all].children[0].material[0].color=new THREE.Color(font_color_default);
                scene.remove(xdel_group_lightPoint);
                xdel_group_lightPoint=undefined;
            }
            if (xdel_group_pl) {
                scene.remove(xdel_group_pl);
                xdel_group_pl.remove(xdel_mesh_group_pl);
                xdel_mesh_group_pl=undefined;
                xdel_group_pl=undefined;
            }
        }


        var MyIntervalID_Y = setInterval(function(){
            //console.log('задержка');
            if (!!font) {
                clearInterval (MyIntervalID_Y);
                y_group = new THREE.Group();
                if (y_text ) {
                    var y_mesh=createText(y_text,4);
                    y_group.add(y_mesh);
                }
                y_group.rotation.y=-0.5*Math.PI;
                y_group.position.x = t_max_x+height_konus;
                y_group.position.y = t_0_y;
                y_group.position.z = t_0_z-10;
                scene.add(y_group);

                //создаем шкалу строк
                        var id_t=window.table_id;
                        var table_par=tableOLAP;
                        var rep_tab_tr=$(table_par).find('tr');
                        var rep_tab=$(rep_tab_tr).find('td');
                        var str_max_length=0;
                        var mass_min_str=[];
                        var mass_max_str=[];
                        $(rep_tab_tr).filter('.tr_tab').each(function(i,elem) {
                            //console.log(elem);
                            mass_str[i]='';
                            mass_str_vector[i]=[];
                            $(elem).find('td.td_str_val').each(function(i2,elem2) {
                                mass_str[i]+=$(elem2).text()+' ';
                                var str_length_tek=mass_str[i].length;
                                if (str_length_tek>str_max_length) {
                                    str_max_length=str_length_tek;
                                }
                                mass_str_vector[i][i2]=$(elem2).text();
                                if (!!!mass_min_str[i2]) {
                                    mass_min_str[i2]=mass_str_vector[i][i2].length;
                                }
                                else if (mass_str_vector[i][i2].length<mass_min_str[i2]) {
                                    mass_min_str[i2]=mass_str_vector[i][i2].length;
                                }
                                if (!!!mass_max_str[i2]) {
                                    mass_max_str[i2]=mass_str_vector[i][i2].length;
                                }
                                else if (mass_str_vector[i][i2].length>mass_max_str[i2]) {
                                    mass_max_str[i2]=mass_str_vector[i][i2].length;
                                }
                            });
                        });
                        var material_liney = new THREE.LineBasicMaterial({ color: 0xcece46,linewidth: 5 });
                        var t_k_group_z=t_0_z_str;
                        var t_k_group_three_z=t_0_z_str;
                        var t_k_group_x=t_0_x_str;
                        var t_count_group_x=0;
                        var sh_str_group_y=size_str*1.3;
                        var t_k_group_y=t_0_y_str-sh_str_group_y;
                        var material_liney = new THREE.LineBasicMaterial({ color: 0x961596,linewidth: 5 });
                        var mass_str_three_tek=[];
                        var count_str_one=mass_str_vector[0].length;
                        for (var i = 1; i <=(count_str_one-1) ; i++) {
                            mass_str_three_tek[i]='';
                        }
                        var geometry_str_rigth = new THREE.CylinderGeometry( 0, size_str, size_str*2, 3 ); // Геометрия (радиус вверху, радиус внизу, длина, число сегментов
                        var material_str_rigth_left = new THREE.MeshLambertMaterial( {color: 0xa0068c}); // Материал
                        var str_rigth = new THREE.Mesh( geometry_str_rigth, material_str_rigth_left ); // Массив
                        str_rigth.rotation.y=0.5*Math.PI;
                        str_rigth.rotation.z=0.5*Math.PI;
                        str_rigth.position.x = t_0_x_str;
                        str_rigth.position.y = t_0_y_str+size_str*2;
                        str_rigth.position.z = t_k_group_three_z;
                        str_rigth.cursor = 'pointer';
                        str_rigth.on('click', function(ev) {
                            var this_plan_index;
                            if (tek_count_plan>1) {
                                this_plan_index=tek_count_plan-1;
                                str_tree_update(this_plan_index);
                            }
                        });
                        scene.add(str_rigth);
                        t_k_group_three_z-=size_str*3.3;
                        str_add_tree_one(count_plan,t_k_group_three_z);
                        plan_txt_group[count_plan].visible=false;
                        sphere[count_plan].visible=false;
                        str_rigth.visible=false;
                        var pr_visible=true;
                        var tek_plan_left_index=0;
                        var t_count_all=0;
                        mass_str_vector.forEach(function(element,index) {
                            t_count_group_x+=1;
                            //console.log(index);
                            //console.log(t_count_group_x);
                            if (t_k_group_y<t_max_y_str) {
                                mass_plan_index[count_plan]=[tek_plan_left_index,t_count_all-1];
                                tek_plan_left_index=t_count_all;
                                pr_visible=false;
                                count_plan+=1;
                                t_k_group_three_z-=/*String(count_plan).length**/(size_str*4);
                                str_add_tree_one(count_plan,t_k_group_three_z);
                                t_count_group_x=1;
                                //t_k_group_x+=sh_group_x;
                                t_k_group_y=t_0_y_str-sh_str_group_y;
                                //console.log(t_k_group_x);
                            }

                            t_k_group_z=t_0_z_str;

                            var pr_uzel=false;
                            for (var i = 0; i <=(count_str_one-2); i++) {
                                var text=String(element[i]);
                                if (text!==String(mass_str_three_tek[i])) {
                                    //console.log(text);
                                    pr_uzel=true;
                                    break;
                                }
                            }
                            if (pr_uzel) {
                                for (var i2 = 0; i2 <(count_str_one-1); i2++) {
                                    //console.log(element[i]);
                                    mass_str_three_tek[i2]=String(element[i2]);
                                }
                                if (i!=0) {
                                    for (var i2 = 0; i2 < i; i2++) {
                                        //t_k_group_z-=String(element[i2]).length*size_str/1.1;
                                        t_k_group_z-=mass_max_str[i2]*size_str/1.1;
                                    }
                                }
                                for (var i2 = i; i2 <(count_str_one-1); i2++) {
                                    var text=String(element[i2])+' *';
                                    //console.log(mass_pok_three_tek);
                                    ydel_group[t_count_all] = new THREE.Group();
                                    ydel_group[t_count_all].str_index=index;
                                    ydel_group[t_count_all].t_count_all=t_count_all;
                                    ydel_group[t_count_all].count_plan=count_plan;
                                    ydel_group[t_count_all].str_tree_index=i2;
                                    ydel_group[t_count_all].pr_tree=true;
                                    if (text) {
                                        ydel_mesh_group[t_count_all]=createText(text,size_str);
                                        ydel_group[t_count_all].add(ydel_mesh_group[t_count_all]);
                                    }
                                    ydel_group[t_count_all].rotation.y=-0.5*Math.PI;
                                    ydel_group[t_count_all].position.x = t_k_group_x;
                                    ydel_group[t_count_all].position.y = t_k_group_y;
                                    ydel_group[t_count_all].position.z = t_k_group_z-((text.length)*size_str/2/1.1);
                                    if (!pr_visible) {
                                        //ydel_group[t_count_all].Mesh.material.opacity = 0;
                                        ydel_group[t_count_all].visible=false;
                                    }

                                    ydel_group[t_count_all].cursor = 'pointer';
                                    ydel_group[t_count_all].on('click', function(ev) {
                                        var this_str_index=this.str_index;
                                        var pr_end=false;
                                        var this_str_tree_index=this.str_tree_index;
                                        var str_tree_value=String(mass_str_vector[this_str_index][this_str_tree_index]);
                                        var tek_count_plan=this.count_plan;
                                        var this_t_count_all=this.t_count_all;
                                        mass_str_tree_call_min_max[0]=this_str_index;
                                        for (var ii2 = this_str_index; ((ii2 <=(mass_str.length-1)) & (!pr_end)); ii2++) {
                                            if (String(mass_str_vector[ii2][this_str_tree_index])!==str_tree_value) {
                                                pr_end=true;
                                            }
                                        }
                                        mass_str_tree_call_min_max[1]=ii2-2;
                                        //console.log(mass_str_tree_call_min_max);

                                        if(isNaN(mass_pok_tree_call_min_max[0])) {
                                            mass_pok_tree_call_min_max[0]=0;
                                            mass_pok_tree_call_min_max[1]=mass_pok.length-1;
                                        }
                                        str_upd_cube_opa(mass_str_tree_call_min_max,mass_pok_tree_call_min_max,this,undefined);

                                        if (!ydel_group_lightPoint[tek_count_plan]) {
                                            //ydel_group_lightPoint[tek_count_plan] = new THREE.PointLight( 0xea12d5, 150, size_str*2);
                                            ydel_group_lightPoint[tek_count_plan] = new THREE.RectAreaLight( 0xffffff, 1,  size_str*mass_str_vector[this_str_index][this_str_tree_index].length, size_str );
                                        }
                                        else {
                                            ydel_group[ydel_group_lightPoint[tek_count_plan].t_count_all].children[0].material[0].color=new THREE.Color(font_color_default);
                                        }
                                        if (ydel_group_lightPoint[tek_count_plan].t_count_all!==this_t_count_all) {
                                            scene.add(ydel_group_lightPoint[tek_count_plan]);
                                            ydel_group_lightPoint[tek_count_plan].count_plan=tek_count_plan;
                                            ydel_group_lightPoint[tek_count_plan].str_tree_index=this_str_tree_index;
                                            ydel_group_lightPoint[tek_count_plan].str_index=this_str_index;
                                            ydel_group_lightPoint[tek_count_plan].t_count_all=this_t_count_all;
                                            ydel_group_lightPoint[tek_count_plan].pr_tree=true;
                                            ydel_group_lightPoint[tek_count_plan].min_str_index=mass_str_tree_call_min_max[0];
                                            ydel_group_lightPoint[tek_count_plan].max_str_index=mass_str_tree_call_min_max[1];
                                            ydel_group_lightPoint[tek_count_plan].position.set( this.position.x-1, this.position.y+size_str/2, this.position.z);
                                            this.children[0].material[0].color=new THREE.Color(0xea12d5);
                                            if (ydel_group_pl) {
                                                scene.remove(ydel_group_pl);
                                                ydel_group_pl.remove(ydel_mesh_group_pl);
                                                ydel_mesh_group_pl=undefined;
                                                ydel_group_pl=undefined;
                                            }
                                        }
                                        else {
                                            str_tree_clear_group(tek_count_plan);
                                        }

                                        cube_clear_group();

                                        //если есть кубы узлов с других страниц, то отключим их
                                        for (var ii2 = 1; ii2 <=count_plan; ii2++) {
                                            if (ii2==tek_count_plan) continue;
                                            if (ydel_group_lightPoint[ii2]) {
                                                ydel_group[ydel_group_lightPoint[ii2].t_count_all].children[0].material[0].color=new THREE.Color(font_color_default);
                                                scene.remove(ydel_group_lightPoint[ii2]);
                                                ydel_group_lightPoint[ii2]=undefined;
                                            }
                                            if (tek_cube_click[ii2]) {
                                                delete tek_cube_click[ii2];
                                            }
                                        }

                                    });

                                    scene.add(ydel_group[t_count_all]);
                                    t_k_group_z-=mass_max_str[i2]*size_str/1.1;
                                    t_k_group_y-=sh_str_group_y;
                                    t_count_all+=1;
                                }
                            }
                            else {
                                for (var i2 = 0; i2 < (count_str_one-1) ; i2++) {
                                    t_k_group_z-=mass_max_str[i2]*size_str/1.1;
                                }
                            }

                            //console.log(t_count_all);
                            //console.log(ydel_group);
                            i=(count_str_one-1);
                            ydel_group[t_count_all] = new THREE.Group();
                            ydel_group[t_count_all].str_index=index;
                            ydel_group[t_count_all].str_tree_index=i;
                            ydel_group[t_count_all].t_count_all=t_count_all;
                            ydel_group[t_count_all].count_plan=count_plan;
                            var text=element[i];
                            if (text) {
                                ydel_mesh_group[t_count_all]=createText(text,size_str);
                                ydel_group[t_count_all].add(ydel_mesh_group[t_count_all]);
                            }
                            ydel_group[t_count_all].rotation.y=-0.5*Math.PI;
                            ydel_group[t_count_all].position.x = t_k_group_x;
                            ydel_group[t_count_all].position.y = t_k_group_y;
                            ydel_group[t_count_all].position.z = t_k_group_z-((text.length)*size_str/2/1.1);
                            if (!pr_visible) {
                                ydel_group[t_count_all].visible=false;
                            }

                            ydel_group[t_count_all].cursor = 'pointer';
                            ydel_group[t_count_all].on('click', function(ev) {
                                var this_str_index=this.str_index;
                                var this_t_count_all=this.t_count_all;
                                var this_str_tree_index=this.str_tree_index;
                                mass_str_tree_call_min_max[0]=this_str_index;
                                mass_str_tree_call_min_max[1]=this_str_index;
                                if(isNaN(mass_pok_tree_call_min_max[0])) {
                                    mass_pok_tree_call_min_max[0]=0;
                                    mass_pok_tree_call_min_max[1]=mass_pok.length-1;
                                }
                                str_upd_cube_opa(mass_str_tree_call_min_max,mass_pok_tree_call_min_max,this,undefined);
                                if (!ydel_group_lightPoint[tek_count_plan]) {
                                    //ydel_group_lightPoint[tek_count_plan] = new THREE.PointLight( 0xea12d5, 150, size_str*2);
                                    ydel_group_lightPoint[tek_count_plan] = new THREE.RectAreaLight( 0xffffff, 1,  size_str*mass_str_vector[this_str_index][this_str_tree_index].length,size_str);
                                    /*var rectLightHelper = new THREE.RectAreaLightHelper(ydel_group_lightPoint[tek_count_plan]);
                                    scene.add( rectLightHelper );*/
                                }
                                else {
                                    ydel_group[ydel_group_lightPoint[tek_count_plan].t_count_all].children[0].material[0].color=new THREE.Color(font_color_default);
                                }
                                //this.remove(ydel_mesh_group[this_t_count_all]);
                                if (ydel_group_lightPoint[tek_count_plan].t_count_all!==this_t_count_all) {
                                    scene.add(ydel_group_lightPoint[tek_count_plan]);
                                    ydel_group_lightPoint[tek_count_plan].count_plan=this.count_plan;
                                    ydel_group_lightPoint[tek_count_plan].str_tree_index=this.str_tree_index;
                                    ydel_group_lightPoint[tek_count_plan].str_index=this_str_index;
                                    ydel_group_lightPoint[tek_count_plan].t_count_all=this_t_count_all;
                                    ydel_group_lightPoint[tek_count_plan].min_str_index=mass_str_tree_call_min_max[0];
                                    ydel_group_lightPoint[tek_count_plan].max_str_index=mass_str_tree_call_min_max[1];
                                    ydel_group_lightPoint[tek_count_plan].position.set( this.position.x-1, this.position.y+size_str/2, this.position.z);
                                    ydel_group_lightPoint[tek_count_plan].rotation.y=0.5*Math.PI;

                                    text=mass_str[this_str_index];
                                    //console.log(mass_str[this_str_index]);
                                    //console.log(mass_plan_index[this.count_plan][0]);
                                    if (text) {
                                        if (!ydel_group_pl) {
                                            console.log(ydel_group_pl);
                                            ydel_group_pl=new THREE.Group();
                                        }
                                        else if (ydel_mesh_group_pl){
                                            ydel_group_pl.remove(ydel_mesh_group_pl);
                                        }
                                        ydel_mesh_group_pl=createText(text,size_str);
                                        ydel_group_pl.add(ydel_mesh_group_pl);
                                        ydel_group_pl.rotation.y=-0.5*Math.PI;
                                        ydel_group_pl.position.x = mass_kor_str[this_str_index-ydel_group[mass_plan_index[this.count_plan][0]].str_index];
                                        //ydel_group_pl.position.x =position_x;
                                        ydel_group_pl.position.y = t_0_y+2;
                                        ydel_group_pl.position.z = t_0_z-size_str*text.length/1.3/2;
                                        scene.add(ydel_group_pl);
                                    }
                                    //ydel_mesh_group[this_t_count_all]=createText(mass_str_vector[this_str_index][this_str_tree_index],size_str,0xea12d5);
                                    this.children[0].material[0].color=new THREE.Color(0xea12d5);
                                }
                                else {
                                    str_tree_clear_group(tek_count_plan);
                                    //ydel_mesh_group[this.t_count_all]=createText(mass_str_vector[this_str_index][this_str_tree_index],size_str);
                                }

                                cube_clear_group();
                                //this.add(ydel_mesh_group[this_t_count_all]);
                            });

                            scene.add(ydel_group[t_count_all]);

                            t_k_group_y-=sh_str_group_y;
                            t_count_all+=1;
                        });


                        t_count_all-=1;
                        mass_plan_index[count_plan]=[tek_plan_left_index,t_count_all];
                        //console.log(mass_plan_index);
                        console.log(ydel_group);
                        if (!pr_visible) {
                            plan_txt_group[1].visible=true;
                            sphere[1].visible=true;
                            lightPoint = new THREE.PointLight( 0xea12d5, 100, size_str*3);
                            lightPoint.position.set( sphere[1].position.x-2, sphere[1].position.y, sphere[1].position.z);
                            scene.add(lightPoint);
                            t_k_group_three_z-=size_str*3.3
                            var geometry_str_left = new THREE.CylinderGeometry( 0, size_str, size_str*2, 3 ); // Геометрия (радиус вверху, радиус внизу, длина, число сегментов
                            var material_str_rigth_left = new THREE.MeshLambertMaterial( {color: 0xa0068c}); // Материал
                            var str_left = new THREE.Mesh( geometry_str_left, material_str_rigth_left ); // Массив
                            str_left.rotation.y=0.5*Math.PI;
                            str_left.rotation.z=-0.5*Math.PI;
                            str_left.position.x = t_0_x_str;
                            str_left.position.y = t_0_y_str+size_str*2;
                            str_left.position.z = t_k_group_three_z;
                            str_left.cursor = 'pointer';
                            str_left.on('click', function(ev) {
                                var this_plan_index;
                                if (tek_count_plan<count_plan) {
                                    this_plan_index=tek_count_plan+1;
                                    str_tree_update(this_plan_index);
                                }
                            });

                            scene.add(str_left);
                            str_rigth.visible=true;
                        }


                        //ищем максимальный диапазон
                        max_count_str_group_y=0;
                        for (var i = 1; i <=count_plan; i++) {
                            //console.log(mass_plan_index[i][1]);
                            //console.log(ydel_group[mass_plan_index[i][1]].str_index);
                            var tek_max_count=ydel_group[mass_plan_index[i][1]].str_index-ydel_group[mass_plan_index[i][0]].str_index+1;
                            if (tek_max_count>max_count_str_group_y) {
                                max_count_str_group_y=tek_max_count;
                            }
                        }
                        //console.log(max_count_str_group_y);
                        //шах строк
                        sh_str=(t_max_x-t_0_x-(max_count_str_group_y+1)*zazor)/(max_count_str_group_y+1);
                        var t_k=t_0_x+sh_str+zazor;
                        for (var i = 0; i <= (max_count_str_group_y-1) ; i++) {
                            //деления
                            var geometry_delx = new THREE.Geometry();
                            geometry_delx.vertices.push(new THREE.Vector3(t_k, t_0_y-1, t_0_z));//xyz
                            geometry_delx.vertices.push(new THREE.Vector3(t_k, t_0_y+1,t_0_z));
                            var del_x = new THREE.Line(geometry_delx, material_x);
                            scene.add(del_x);

                            //линии сетки
                            var geometry_liney = new THREE.Geometry();
                            geometry_liney.vertices.push(new THREE.Vector3(t_k, t_0_y, t_0_z));//xyz
                            geometry_liney.vertices.push(new THREE.Vector3(t_k, t_0_y,t_max_z));
                            var line_y = new THREE.Line(geometry_liney, material_liney);
                            scene.add(line_y);

                            mass_kor_str[i]=t_k;
                            t_k+=sh_str+zazor;
                        }
                        //console.log(mass_pok);

            }
        },500);

        var material_z = new THREE.LineBasicMaterial({ color: 0x0000ff,linewidth: 5 });
        var geometry_z = new THREE.Geometry();
        geometry_z.vertices.push(new THREE.Vector3(t_0_z, t_0_y, t_0_z));//xyz
        geometry_z.vertices.push(new THREE.Vector3(t_0_x, t_max_y, t_0_z));
        var os_z = new THREE.Line(geometry_z, material_z);
        scene.add(os_z);

        var geometry_zk = new THREE.CylinderGeometry( 0, 1, 5, 32 ); // Геометрия (радиус вверху, радиус внизу, длина, число сегментов
        var material_zk = new THREE.MeshBasicMaterial( {color: 0x0000ff} ); // Материал
        var z_konus = new THREE.Mesh( geometry_zk, material_zk ); // Массив
        z_konus.rotation.y=0.5*Math.PI;
        z_konus.position.x = t_0_x;
        z_konus.position.y = t_max_y;
        z_konus.position.z = t_0_z;
        scene.add(z_konus);

        function cube_clear_group() {
            if (tek_cube_click[tek_count_plan]) {
                cube_group.remove(cube_mesh);
                cube_group_pok.remove(cube_mesh_pok);
                cube_group_str.remove(cube_mesh_str);
                delete tek_cube_click[tek_count_plan];
            }
        }

        function cube_call_group(cube_one) {
            var text=String(cube[cube_one.mass_c_i][cube_one.mass_c_i2].value);
            if (text) {
                cube_group.remove(cube_mesh);
                cube_mesh=createText(text,4);
                cube_group.add(cube_mesh);
            }
            var dop_y1=0;
            if (cube[cube_one.mass_c_i][cube_one.mass_c_i2].height_cub<0) {
                dop_y1=-5;
            }
            cube_group.rotation.y=-0.5*Math.PI;
            cube_group.position.x = cube_one.position.x;
            cube_group.position.y = t_0_y+cube[cube_one.mass_c_i][cube_one.mass_c_i2].height_cub+dop_y1;
            cube_group.position.z = cube_one.position.z;
            scene.add(cube_group);

            text=String(cube[cube_one.mass_c_i][cube_one.mass_c_i2].pok_val);
            if (text) {
                cube_group_pok.remove(cube_mesh_pok);
                cube_mesh_pok=createText(text,4);
                cube_group_pok.add(cube_mesh_pok);
            }
            var dop_y2=5;
            if (cube[cube_one.mass_c_i][cube_one.mass_c_i2].height_cub<0) {
                dop_y2=-10;
            }
            cube_group_pok.rotation.y=-0.5*Math.PI;
            cube_group_pok.position.x = cube_one.position.x;
            cube_group_pok.position.y = t_0_y+cube[cube_one.mass_c_i][cube_one.mass_c_i2].height_cub+dop_y2;
            cube_group_pok.position.z = cube_one.position.z;
            scene.add(cube_group_pok);

            text=String(cube[cube_one.mass_c_i][cube_one.mass_c_i2].str_val);
            if (text) {
                cube_group_str.remove(cube_mesh_str);
                cube_mesh_str=createText(text,4);
                cube_group_str.add(cube_mesh_str);
            }
            var dop_y3=10;
            if (cube[cube_one.mass_c_i][cube_one.mass_c_i2].height_cub<0) {
                dop_y3=-15;
            }

            cube_group_str.rotation.y=-0.5*Math.PI;
            cube_group_str.position.x = cube_one.position.x;
            cube_group_str.position.y = t_0_y+cube[cube_one.mass_c_i][cube_one.mass_c_i2].height_cub+dop_y3;
            cube_group_str.position.z = cube_one.position.z;
            scene.add(cube_group_str);
        }

        function cube_add(j,i,i2,visible) {
            if (!!cube[i][i2]) {
                //var cube_material = new THREE.MeshLambertMaterial( {color: 0xa9fca9,transparent: true} );
                var cube_material = new THREE.MeshStandardMaterial( {color: 0xa9fca9,transparent: true} );
                var cube_geometry = new THREE.BoxGeometry(sh_pok, Math.abs(cube[i][i2].height_cub),sh_str);
                cube_mass[i][i2]=new THREE.Mesh( cube_geometry, cube_material );
                cube_mass[i][i2].rotation.y=-0.5*Math.PI;
                cube_mass[i][i2].position.x = mass_kor_str[i-ydel_group[mass_plan_index[j][0]].str_index]-sh_str/2-zazor/2;
                cube_mass[i][i2].position.y =t_0_y+cube[i][i2].height_cub/2;
                cube_mass[i][i2].position.z = mass_kor_pok[i2]+sh_pok/2-zazor/2-sh_pok;
                cube_mass[i][i2].mass_c_i=i;
                cube_mass[i][i2].mass_c_i2=i2;
                cube_mass[i][i2].cursor = 'pointer';
                cube_mass[i][i2].visible=visible;
                cube_mass[i][i2].on('click', function(ev) {
                    cube_call_group(this);
                    //console.log(cube_mass);
                    //if (isNaN(mass_str_tree_call_min_max[0]))
                    mass_str_tree_call_min_max[0]=ydel_group[mass_plan_index[tek_count_plan][0]].str_index;
                    mass_str_tree_call_min_max[1]=ydel_group[mass_plan_index[tek_count_plan][1]].str_index;
                    var pr_dop_opa=false;
                    for (var ii = 1; ii <= count_plan ; ii++) {
                        if (ydel_group_lightPoint[ii]) {
                            if (ydel_group_lightPoint[ii].pr_tree) {
                                pr_dop_opa=true;
                                str_tree_clear_group(ii);
                                break;
                            }
                        }
                    }
                    if ((pr_dop_opa) || (xdel_group_lightPoint)) {
                        for (var ii = 0; ii < mass_str_tree_call_min_max[0] ; ii++) {
                            for (var ii2 = 0; ii2 <= (mass_kor_pok.length -1) ; ii2++) {
                                if (cube[ii][ii2]) {
                                    cube_mass[ii][ii2].material.opacity = 1;
                                }
                            }
                        }
                        for (var ii = (mass_str_tree_call_min_max[1]+1); ii <= (mass_str.length-1) ; ii++) {
                            for (var ii2 = 0; ii2 <= (mass_kor_pok.length -1) ; ii2++) {
                                if (cube[ii][ii2]) {
                                    cube_mass[ii][ii2].material.opacity = 1;
                                }
                            }
                        }
                    }
                    else {
                        str_tree_clear_group(tek_count_plan);
                    }

                    pok_tree_clear_group();

                    var opa1;
                    if (tek_cube_click[tek_count_plan]) {
                        if ((tek_cube_click[tek_count_plan]['mass_c_i']==this.mass_c_i) & (tek_cube_click[tek_count_plan]['mass_c_i2']==this.mass_c_i2)) {
                            opa1=1;
                        }
                        else {
                            opa1=0.3;
                        }
                    }
                    else {
                        opa1=0.3;
                    }

                    for (var ii = mass_str_tree_call_min_max[0]; ii <= mass_str_tree_call_min_max[1] ; ii++) {
                        for (var ii2 = 0; ii2 <= (mass_kor_pok.length -1) ; ii2++) {
                            if (cube[ii][ii2]) {
                                cube_mass[ii][ii2].material.opacity = opa1;
                            }
                        }
                    }
                    this.material.opacity = 1;
                    if (tek_cube_click[tek_count_plan]) {
                        if ((tek_cube_click[tek_count_plan]['mass_c_i']==this.mass_c_i) & (tek_cube_click[tek_count_plan]['mass_c_i2']==this.mass_c_i2)) {
                            cube_clear_group();
                        }
                        else {
                            tek_cube_click[tek_count_plan]['mass_c_i']=this.mass_c_i;
                            tek_cube_click[tek_count_plan]['mass_c_i2']=this.mass_c_i2;
                        }
                    }
                    else {
                        tek_cube_click[tek_count_plan]=[];
                        tek_cube_click[tek_count_plan]['mass_c_i']=this.mass_c_i;
                        tek_cube_click[tek_count_plan]['mass_c_i2']=this.mass_c_i2;
                    }
                });
                //cube_one.material[0].transparent = true;
                scene.add(cube_mass[i][i2]);
            }
        }
        var z_text='Значения';
        var cube=[];
        var cube_mass=[];
        var cube_group = new THREE.Group();
        var cube_group_pok = new THREE.Group();
        var cube_group_str = new THREE.Group();
        var cube_mesh,cube_mesh_pok,cube_mesh_str;
        var tek_cube_click=[];

        var MyIntervalID_Z = setInterval(function(){
            //console.log('задержка');
            if (!!font) {
                clearInterval (MyIntervalID_Z);
                var z_group = new THREE.Group();
                if (z_text ) {
                    var z_mesh=createText(z_text,4);
                    z_group.add(z_mesh);
                }
                z_group.rotation.z=0.5*Math.PI;
                z_group.rotation.y=-0.5*Math.PI;
                z_group.position.x = t_0_x;
                z_group.position.y = t_max_y+7;
                z_group.position.z = t_0_z-3;
                //console.log(z_group);
                scene.add(z_group);

                //создаем паралеллеграммы значений
                        var id_t=window.table_id;
                        var table_par=tableOLAP;
                        var rep_tab_tr=$(table_par).find('tr');
                        var rep_tab=$(rep_tab_tr).find('td');
                        $(rep_tab_tr).filter('.tr_tab').each(function(i,elem) {
                            //console.log(elem);
                            cube[i]=[];
                            $(elem).find('td.td_val_val').each(function(i2,elem2) {
                                var tek_txt,
                                    elInput=$(elem2).find('input:not([type="hidden"])');
                                if ($(elInput).length>0) {
                                    if ($(elInput).attr('type')==='checkbox') {
                                      if ($(elInput).prop('checked')) {
                                          tek_txt='1';
                                      }
                                      else {
                                          tek_txt='0';
                                      }
                                    }
                                    else {
                                        tek_txt=$(elInput).val();
                                    }
                                }
                                else {
                                  tek_txt=$(elem2).text().trim();
                                }
                                var tek_zn=parseFloat(tek_txt.replace(',','.')),
                                    height_max;
                                if (!!mass_max_zn_pok[$(elem2).attr('id')]) {
                                    if (Math.abs(mass_max_zn_pok[$(elem2).attr('id')])>Math.abs(mass_min_zn_pok[$(elem2).attr('id')])) {
                                        height_max=mass_max_zn_pok[$(elem2).attr('id')];
                                    }
                                    else {
                                        height_max=mass_min_zn_pok[$(elem2).attr('id')];
                                    }
                                    if (height_max===0) {
                                        height_max=1;
                                    }
                                }
                                else {
                                    if ((mass_zn_tek.length>0) & (tek_txt.length>0)) {
                                        height_max=mass_zn_tek.length;
                                        tek_zn=mass_zn_tek.indexOf(tek_txt)+1;
                                    }
                                }

                                if (!isNaN(tek_zn)) {
                                    var height_cub=(tek_zn/height_max)*(t_max_y-t_0_y-5);
                                    cube[i][i2]=new Object();
                                    cube[i][i2].value=tek_txt;
                                    cube[i][i2].height_cub=height_cub;
                                    cube[i][i2].pok_val=mass_pok[i2];
                                    cube[i][i2].str_val=mass_str[i];
                                }
                            });
                        });


                        for (var i = 0; i <= ydel_group[mass_plan_index[1][1]].str_index ; i++) {
                            cube_mass[i]=[];
                            for (var i2 = 0; i2 <= (mass_kor_pok.length -1) ; i2++) {
                                cube_add(1,i,i2,true);
                            }
                        }
                        for (var j = 2; j <= count_plan ; j++) {
                            //ydel_group[mass_plan_index[j][0]].real_index=ydel_group[mass_plan_index[j][0]].str_index-ydel_group[mass_plan_index[j][0]].str_index;
                            for (var i = ydel_group[mass_plan_index[j][0]].str_index; i <= ydel_group[mass_plan_index[j][1]].str_index ; i++) {
                                cube_mass[i]=[];
                                for (var i2 = 0; i2 <= (mass_kor_pok.length -1) ; i2++) {
                                    cube_add(j,i,i2,false);
                                }
                            }
                        }

            }
        },500);


	camera.position.x = -305;
	camera.position.y = 77;
	camera.position.z = -33;

        var controls = new THREE.OrbitControls(camera);
        controls.update();

        function animate() {
            requestAnimationFrame( animate );
            controls.update();
            renderer.render( scene, camera );
        }


	$(container).append(renderer.domElement);//Добавляем рендер в DOM для вывода на экран
	renderer.render(scene, camera);
        animate();
});
