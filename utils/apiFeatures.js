class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        //Construyendo la query 
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        //Filtro de operadores (gte,gt,lte,lt)
        //Filtrar -> ej: rating[gte] - 200 (key-value)
        let queryStr = JSON.stringify(queryObj);

        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) //regex - reemplaza el operador por $operador
        this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        //sort -> sort = title | sort = -title | sort=title,author 
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query.sort(sortBy); //.sort(title author)
        } else {
            this.query.sort('-createdAt');
        }
        return this;

    }

    limitFields() {

        //Limitar campos -> flields = title,author,description 
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query.select(fields);

        } else {
            this.query.select('-__v'); // con el "-" se excluye la property __v
        }
        return this;

    }

    paginate() {
        //Paginacion
        const page = this.queryString.page * 1 || 1; //default page = 1
        const limit = this.queryString.limit * 1 || 100; //default limit = 100
        const skip = (page - 1) * limit;
        this.query.skip(skip).limit(limit);
        return this;
    }

}
module.exports = APIFeatures;